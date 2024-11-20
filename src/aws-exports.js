
export const REGION = 'ap-south-1';
export const POOL_ID= 'ap-south-1_gNzEsBZpV';
export const CLIENT_ID= '2e7odi4eesjhlkrbkv3iu56kim';
export const IDENTITY_POOL_ID = 'ap-south-1:32dfc4b7-32cb-4ec5-a3f5-508c3abf3bc1';
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const awsmobile = {
    aws_project_region: REGION,
    aws_cognito_identity_pool_id: IDENTITY_POOL_ID, // Optional, if you're using identity pools
    aws_cognito_region: REGION,
    aws_user_pools_id: POOL_ID,
    aws_user_pools_web_client_id: CLIENT_ID,
};


export default awsmobile;