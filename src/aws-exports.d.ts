import {environment} from '../src/environments/environment'


export const REGION = environment.REGION;
export const POOL_ID= environment.POOL_ID;
export const CLIENT_ID= environment.CLIENT_ID;
export const IDENTITY_POOL_ID = environment.IDENTITY_POOL_ID;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

const awsmobile = {
    Auth:{
    Cognito:{    
    region: REGION,
    userPoolId: IDENTITY_POOL_ID, // Optional, if you're using identity pool
    userPoolClientId: CLIENT_ID,
    identityPoolId:IDENTITY_POOL_ID
    }
}
};


export default awsmobile;
