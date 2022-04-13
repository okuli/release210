import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Service, IService } from '@syncpilot/bpool-guest-lib';
import { AppConfig } from '../../../app.config';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { IGuestUser } from 'src/app/models/configData';
@Component({
  selector: 'devt-connect-call',
  templateUrl: './connect-call.component.html',
  styleUrls: ['./connect-call.component.scss']
})
export class ConnectCallComponent implements OnInit, OnDestroy {

  public currentCallStatus = CallStatus.Initial;
  public callStatus = CallStatus;
  public agents: any;
  public service: any;
  public guestUser = {
    firstName: "",
    lastName: ""
  }
  public beraterpoolResponse: any;
  public selectedAgent: any;
  public ownerId: any;
  public groupId: any;
  public isAgentSelected = false;
  public isAgentAcceptRequest = false;
  public timeoutSec = 0;

  constructor(public appConfig: AppConfig, private _router: Router, public toastrService: ToastrService) {
    this.guestUser.firstName = "VideoTerminal"
    this.guestUser.lastName = `User_${this.generateRandomString()}`;
  }

  public ngOnInit(): void {
    if (this.appConfig.getIsFileExists()) {
      this.appConfig.config = this.appConfig.config
      this.ownerId = this.appConfig.config?.ownerId;
      this.groupId = this.appConfig.config?.groupId;
      this.timeoutSec = this.appConfig.config?.noAgentScreenTimeout;
    } else {
      this.redirectToAdmin();
    }

    this.service = new Service();
    this.setupEvent();
  }

  @HostListener('window:beforeunload', ['$event'])
  public unloadHandler(event: Event) {
    event.returnValue = false;
  }

  public redirectToAdmin(): void {
    this.toastrService.success('', 'V-Terminal is not configured. You will be redirected to Administration.', {
      timeOut: 5000
    });
    setTimeout(() => {
      this._router.navigate(['/admin']);
    }, 5000);
  }

  public generateRandomString(): string {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let charactersLength = characters.length;
    let stringLength = Math.floor(Math.random() * (2 - 1 + 1) + 1)
    for (var i = 0; i < stringLength; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    result += Math.floor(Math.random() * (99 - 10 + 1) + 10)
    return result;
  }

  public ngOnDestroy(): void {
    this.abortService();
  }

  @HostListener('window:beforeunload', ['$event'])
  public beforeUnloadHandler(event: any) {
    this.abortService();
  }

  public abortService(): void {
    try {
      console.log("Service Abort In Connect Call");
      if (this.service) {
        this.service?.abort();
      }

    } catch (error) {

    }
  }

  public async connectAgent(): Promise<void> {
    if (this.currentCallStatus == CallStatus.Connecting) {
      return;
    }
    this.currentCallStatus = CallStatus.Connecting;
    await this.connectToService();
    this.getAgentList();
  }

  public async connectToService(): Promise<void> {
    this.service.setConfig({
      stompUrl: this.appConfig.config.stompUrl,
      serverUrlServer: this.appConfig.config.serverUrlServer,
      fullName: `${this.guestUser.firstName} ${this.guestUser.lastName}`
    });

    let fullName = `${this.guestUser.firstName} ${this.guestUser.lastName}`;

    await this.service.connect(this.ownerId, fullName);
  }

  public async getAgentList(): Promise<void> {
    try {
      console.log("Getting agent list....");
      const result = await this.service.getActiveConsultants(this.ownerId);
      this.agents = result.configData;
      console.log("Got agent list -> ", this.agents);
      if (this.agents.length) {
        this.connectToAgent(this.agents[0]);
      } else {
        this.currentCallStatus = CallStatus.Failed;
        this.reset();
      }
    } catch (error) {
      this.currentCallStatus = CallStatus.Failed;
      this.reset();
    }
  }

  public reset(): void {
    let intervalObj = setInterval(() => {
      if (this.timeoutSec == 0) {
        this.reloadComponent();
        this.timeoutSec = this.appConfig.config.noAgentScreenTimeout;
        clearInterval(intervalObj);
      } else {
        this.timeoutSec -= 1;
      }
    }, 1000);
  }

  public connectToAgent(agent: any): void {
    if (this.isAgentSelected) {
      return;
    }
    console.log("Requesting agent to connect...");
    this.isAgentSelected = true;
    this.selectedAgent = agent;
    this.service.enterQueue(this.createGuestInfo(this.guestUser.firstName, this.guestUser.lastName, 'd'), this.groupId);

  }

  public createGuestInfo(firstName: string, lastName: string, gender: 'm' | 'w' | 'd'): IGuestUser {
    console.log("Creating guest user...");
    return {
      firstName: firstName,
      name: lastName,
      gender: gender,
      additionalGuestInformation: new Map<string, string>()
    }
  }

  public setupEvent(): void {
    this.service.onRedirect.subscribe((response: any) => {
      if (response.state == 'accepted') {
        this.beraterpoolResponse = response;
        console.log("Requested Accepted : ", response);
        this.currentCallStatus = CallStatus.Connected;
        this.isAgentAcceptRequest = true;
      } else if (response.state == 'declined' || response.state == "timeouted" || response.state == "aborted" || response.state == "invalid" || response.state == "killed") {
        console.log("Requested Declined : ", response);
        this.isAgentSelected = false;
        this.isAgentAcceptRequest = false;
        this.selectedAgent = null;
        this.reloadComponent();
      } else if (response.state == 'requested' || response.state == 'prerequest' || response.state == 'extended') {
        console.log("Requested : ", response);
      }
    });
  }

  public reloadComponent(): void {
    window.location.reload();
  }
}

export enum CallStatus {
  Initial = 1,
  Connecting,
  Connected,
  Failed,
}
