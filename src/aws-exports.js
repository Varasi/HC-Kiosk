import {environment} from '../src/environments/environment'


export const REGION = environment.REGION;
export const POOL_ID= environment.POOL_ID;
export const CLIENT_ID= environment.CLIENT_ID;
export const IDENTITY_POOL_ID = environment.IDENTITY_POOL_ID;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

const awsmobile = {
    aws_project_region: REGION,
    aws_cognito_identity_pool_id: IDENTITY_POOL_ID, // Optional, if you're using identity pools
    aws_cognito_region: REGION,
    aws_user_pools_id: POOL_ID,
    aws_user_pools_web_client_id: CLIENT_ID,
};


export default awsmobile;