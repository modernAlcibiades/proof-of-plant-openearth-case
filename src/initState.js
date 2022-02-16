import { nft_api_key, trinsic_api_key, cred_def_id} from "./config.js";
import { NFTStorage } from 'nft.storage';
const {
    CredentialsServiceClient,
    Credentials,
} = require("@trinsic/service-clients");

export default {
    ns_client: new NFTStorage({ token: nft_api_key }),
    trinsic_client: new CredentialsServiceClient(
        new Credentials(trinsic_api_key),
        { noRetryPolicy: true }
    ),
    cred_id: cred_def_id
}