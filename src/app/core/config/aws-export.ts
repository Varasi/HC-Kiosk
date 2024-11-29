import {environment} from '../../../environments/environment'

const awsmobile = {
    aws_project_region:environment. REGION,
    aws_cognito_identity_pool_id:environment. IDENTITY_POOL_ID, // Optional, if you're using identity pools
    aws_cognito_region:environment. REGION,
    aws_user_pools_id:environment. POOL_ID,
    aws_user_pools_web_client_id: environment.CLIENT_ID,
};


export default awsmobile;