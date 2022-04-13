import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AnonymousGrant, RefreshTokenGrant, ClientCredentials, IAccessToken, OAuthClient, JitsiTokenGrant } from '@syncpilot/authentication';
import { ICustomClientData, IRoomManager, IRoomMember, IRoomSubscriber, RoomManager, RoomState, RoomSubscriber, RoomWithoutHostException, SessionCloseStatus } from '@syncpilot/rooms';
import { ISyncClient, SyncClient } from '@syncpilot/sync';
import * as Bowser from 'bowser';
import { AppConfig } from '../../../app.config';
import { map } from "rxjs/operators";
import { ISetting } from 'src/app/models/configData';
// eslint-disable-next-line
declare var JitsiMeetExternalAPI: any;

class RoomJoinDeclinedException extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, RoomJoinDeclinedException.prototype);
  }
}

@Component({
  selector: 'devt-user-agent-details',
  templateUrl: './user-agent-details.component.html',
  styleUrls: ['./user-agent-details.component.scss']
})
export class UserAgentDetailsComponent implements OnInit, OnDestroy {

  @Input() public userAgent: any;
  @Input() public guestUser: any;
  @Input() public service: any;
  @Input() public beraterpoolResponse: any;
  public isRequestAccepted = false;
  public isRequestDeclined = false;
  public requestState: any;
  public hostData: any;
  public roomStateData = RoomState;
  public isMeetingStarted = false;
  public refreshToken: string = "";
  public jitsiToken: string = "";

  //Jitsi Meet
  public domain: string = "meet-dev1.livecontract.de";
  public room: string | null = "";
  public options: any;
  public api: any;
  public user: any;
  public syncClient: any;
  public subscriber: any;
  public isReloadToConnectCall: boolean = false;
  public settings: ISetting = {
    auth: {
      clientId: '',
      clientSecret: '',
      endpointUrl: ''
    },
    sync: {
      channelId: '',
      endpointUrl: ''
    }
  };


  constructor(private _router: Router,
    public appConfig: AppConfig) {
    this.settings = this.appConfig.config?.settings;
    this.domain = this.appConfig.config?.jitsiDomain ? this.appConfig.config?.jitsiDomain : this.appConfig.jitsiConfig?.jitsiDomain;
  }

  public ngOnInit(): void {
    let targetChannelAddressUrl = this.beraterpoolResponse.targetChannelAddress;
    const params = new URL(targetChannelAddressUrl).searchParams;
    this.room = params.get('c')
    this.settings.sync.channelId = this.room ? this.room : "";
    this.run();
    this.userAgent.firstName = this.userAgent && this.userAgent.firstName ? this.userAgent.firstName : "Your";
    this.userAgent.lastName = this.userAgent && this.userAgent.lastName ? this.userAgent.lastName : "Host";

    this.user = {
      name: `${this.guestUser.firstName} ${this.guestUser.lastName}` // set your username
    }
    this.appConfig.jitsiConfig.configOverwrite.defaultRemoteDisplayName = this.user.name;
  }

  public ngOnDestroy(): void {
    this.abortService();
  }

  @HostListener('window:beforeunload', ['$event'])
  public beforeUnloadHandler(event: any) {
    this.abortService();
  }

  @HostListener('window:beforeunload', ['$event'])
  public unloadHandler(event: Event) {
    if (!this.isReloadToConnectCall) {
      event.returnValue = false;
    }
  }

  public abortService() {
    try {
      console.log("Service Abort In User Agent Details");
      if (this.service) {
        this.service?.abort();
      }
    } catch (error) { }
  }

  public startMeeting() {
    if (this.isMeetingStarted) {
      return;
    }
    this.isMeetingStarted = true;
    this.options = {
      roomName: this.room,
      configOverwrite: this.appConfig.jitsiConfig.configOverwrite,
      interfaceConfigOverwrite: this.appConfig.jitsiConfig.interfaceConfigOverwrite,
      parentNode: document.querySelector('#agent'),
      userInfo: {
        displayName: this.user.name
      },
      secret: this.appConfig.config.secret ? this.appConfig.config.secret : this.appConfig.jitsiConfig.secret,
      aud: this.appConfig.config.aud ? this.appConfig.config.aud : this.appConfig.jitsiConfig.aud,
      iss: this.appConfig.config.iss ? this.appConfig.config.iss : this.appConfig.jitsiConfig.iss,
      sub: this.appConfig.config.sub ? this.appConfig.config.sub : this.appConfig.jitsiConfig.sub,
      jwt: this.jitsiToken
    }

    this.api = new JitsiMeetExternalAPI(this.domain, this.options);

    this.api.addEventListeners({
      readyToClose: this.handleClose,
      participantLeft: this.handleParticipantLeft,
      participantJoined: this.handleParticipantJoined,
      videoConferenceJoined: this.handleVideoConferenceJoined,
      videoConferenceLeft: this.handleVideoConferenceLeft,
      audioMuteStatusChanged: this.handleMuteStatus,
      videoMuteStatusChanged: this.handleVideoStatus
    });
  }

  public handleClose = () => {
    console.log("handleClose");
    this.callEnd();
  }

  public handleCloseCustom = () => {
    console.log("handleCloseCustom");
    this.api.executeCommand('hangup');;
    this.callEnd();
  }

  public handleParticipantLeft = async (participant: any) => {
    console.log("handleParticipantLeft", participant);
  }

  public handleParticipantJoined = async (participant: any) => {
    console.log("handleParticipantJoined");
  }

  public handleVideoConferenceJoined = async (participant: any) => {
    console.log("handleVideoConferenceJoined");
  }

  public handleVideoConferenceLeft = () => {
    console.log("handleVideoConferenceLeft");
  }

  public handleMuteStatus = (audio: any) => {
    console.log("handleMuteStatus"); // { muted: true }
  }

  public handleVideoStatus = (video: any) => {
    console.log("handleVideoStatus"); // { muted: true }
  }

  public async callEnd(): Promise<void> {
    this.isReloadToConnectCall = true;
    await this.subscriber?.disconnect();
    if (this.appConfig.config?.isRedirectToSurvey) {
      window.location.href = this.appConfig.config?.surveyUrl;
    } else {
      this._router.navigate(['/call-end']);
    }
  }

  public async run(): Promise<void> {
    try {
      const accessToken = await this.authenticate();
      const syncClient = await this.connect(accessToken);
      const subscriber = await this.authorize(syncClient);
      this.subscriber = subscriber;
      await this.disconnect(syncClient);
      this.rerun();

    } catch (e) {
      if (e instanceof RoomWithoutHostException) {
        console.log('no host available');
        this.redirectToConnectCall();
      } else if (e instanceof RoomJoinDeclinedException) {
        console.log('host declined join request');
        this.redirectToConnectCall();
      } else {
        console.error('unexpected behavior', e);
        this.redirectToConnectCall();
      }
    }
  }

  public async rerun(): Promise<void> {
    try {
      const accessToken = await this.authenticate(true);
      console.log("After the refresh token", accessToken);
      const syncClient = await this.connect(accessToken);
      const subscriber = await this.authorize(syncClient, true);
      this.subscriber = subscriber;
      const jitsiTokenObj = await this.getJitsiToken(accessToken);
      console.log("Jitsi Token Data : ", jitsiTokenObj, jitsiTokenObj.value);
      this.jitsiToken = jitsiTokenObj.value;
      const host: any = await subscriber.roomMembers.pipe(map((members: any[]) => {
        let hostData = members.find((d: any) => {
          if (d.isHost) {
            this.startMeeting();
            this.hostData = d;
            let userName = d && d.username ? d.username : "Your Host";
            [this.userAgent.firstName, this.userAgent.lastName] = userName.split(" ");
          }
          return d.isHost;
        })
        return hostData;
      })).toPromise();

      // subscribe to messages by subject
      subscriber.onMessage<string>('sessionCloseStatus').subscribe(message => {
        console.log("Got Msg >>> ", message.subject, message.headers, message.value);
      });

      // broadcast message (to all without sender)
      subscriber.broadcast('mySubject', { 'myHeaderItem': '123' }, { myBodyItem: '456' });

    } catch (e) {
      if (e instanceof RoomWithoutHostException) {
        console.log('no host available');
        this.redirectToConnectCall();
      } else if (e instanceof RoomJoinDeclinedException) {
        console.log('host declined join request');
        this.redirectToConnectCall();
      } else {
        console.error('unexpected behavior', e);
        this.redirectToConnectCall();
      }
    }
  }

  private async disconnect(syncClient: ISyncClient): Promise<void> {
    console.log("Disconnect");
    syncClient?.disconnect();
  }

  private async authenticate(isRerun = false): Promise<IAccessToken> {
    console.log("authenticate", isRerun);
    const clientCredentials = new ClientCredentials(this.settings.auth.clientId, this.settings.auth.clientSecret);
    const tokenEndpointUrl = this.settings.auth.endpointUrl;
    const authClient = new OAuthClient({ clientCredentials, tokenEndpointUrl });
    if (isRerun) {
      console.log("Refresh token", this.refreshToken);
      return authClient.getAccessToken(new RefreshTokenGrant(this.refreshToken));
    } else {
      return authClient.getAccessToken(new AnonymousGrant(`${this.guestUser.firstName} ${this.guestUser.lastName}`, this.settings.sync.channelId));

    }
  }

  private async getJitsiToken(accessToken: IAccessToken) {
    console.log("Jitsi token");
    const clientCredentials = new ClientCredentials(this.settings.auth.clientId, this.settings.auth.clientSecret);
    const tokenEndpointUrl = this.settings.auth.endpointUrl;
    const authClient = new OAuthClient({ clientCredentials, tokenEndpointUrl });

    return authClient.getAccessToken(new JitsiTokenGrant(accessToken.value));
  }

  private async connect(accessToken: IAccessToken): Promise<ISyncClient> {
    console.log("Connect", accessToken);
    this.refreshToken = accessToken.refreshToken;
    const syncClient = new SyncClient({
      endpointUrl: this.settings.sync.endpointUrl,
      logTraffic: true // for debugging
    });

    await syncClient.connect(accessToken.value);

    syncClient.connectionError.subscribe(() => {
      // handle unexpected disconnect here
      // usually you should clear tokens and redirect user back to join view.
      console.log("Connection error");
      syncClient?.disconnect();
      this.redirectToConnectCall();

    });

    return syncClient;
  }

  private async authorize(syncClient: ISyncClient, isRerun = false): Promise<IRoomManager> {
    console.log("authorize", isRerun);
    let data = await new Promise<IRoomManager>(async (resolve, reject) => {
      try {
        const subscriber = new RoomManager(syncClient, this.settings.sync.channelId);
        await subscriber.joinRoom(this.getClientData());

        subscriber.subscriptionState.subscribe(state => {
          console.log("State :-", state);
          if (state === RoomState.Confirmed) {
            console.log("Request Accepted");
            if (isRerun) {
              this.requestState = state
              this.isRequestAccepted = true;
              this.isRequestDeclined = false;
            } else {
              subscriber.disconnect()
            }
            resolve(subscriber);
          } else if (state == RoomState.Declined) {
            this.isRequestDeclined = true;
            this.isRequestAccepted = false;
            this.requestState = state
            setTimeout(() => {
              this.redirectToConnectCall();
            }, 5000);
            reject(new RoomJoinDeclinedException('join declined by host'));
          } else if (state == RoomState.Pending) {
            this.isRequestDeclined = false;
            this.isRequestAccepted = false;
            this.requestState = state
          } else if (state == RoomState.Kicked || state == RoomState.Logout) {
            this.isRequestDeclined = true;
            this.isRequestAccepted = false;
            this.requestState = state;
            this.callEnd();
          }
        });

        subscriber.sessionClose.subscribe(status => {
          if (status === SessionCloseStatus.Decline) {
            reject(new RoomJoinDeclinedException('join declined by host'));
          } else {
            // handle serverside session termination here.
            // usually you should clear tokens and redirect user back to join view.
            subscriber?.disconnect();
            this.callEnd();
          }
        });
      } catch (e) {
        reject(e);
      }
    });
    return data;
  }

  private getClientData(): ICustomClientData {
    const {
      browser: { name: browserName },
      browser: { version: browserVersion },
      os: { name: os }
    } = Bowser.parse(window.navigator.userAgent);

    return { browserName, browserVersion, os };
  }

  public redirectToConnectCall(): void {
    this.isReloadToConnectCall = true;
    window.location.reload();
  }

}
