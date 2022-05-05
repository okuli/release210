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

/* eslint-disable */
export interface IKeycloakConfig {
  KEYCLOAK_AUTH_SERVER_URL: string,
  KEYCLOAK_REALM: string,
  KEYCLOAK_RESOURCE: string,
  KEYCLOAK_IS_SSL_REQUIRED: string,
  KEYCLOAK_IS_BEARER_ONLY: boolean,
  KEYCLOAK_IS_PUBLIC_CLIENT: boolean,
  KEYCLOAK_IS_RESOURCE_ROLE_MAPPINGS: boolean
}
/* eslint-enable */ 