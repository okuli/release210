export interface ISettingAuth {
  clientId: string;
  clientSecret: string;
  endpointUrl: string;
}

export interface ISettingSync {
  channelId: string;
  endpointUrl: string;
}

export interface ISetting {
  auth: ISettingAuth;
  sync: ISettingSync;
}

export interface IConfigData {
  stompUrl: string;
  serverUrlServer: string;
  ownerId: number;
  groupId: number;
  settings: ISetting;
  jitsiDomain: string;
  secret: string;
  aud: string;
  iss: string;
  sub: string;
  byeScreenTimeout: number;
  noAgentScreenTimeout: number;
  isRedirectToSurvey: boolean;
  surveyUrl: string;
}

export interface IGuestUser {
  firstName: string,
  name: string,
  gender: string,
  additionalGuestInformation: any
}
