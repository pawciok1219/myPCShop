import { LightningElement, api} from 'lwc';

export default class ProductRecordCard extends LightningElement {
    @api product;
    sfdcBaseURL;    
    
    renderedCallback() {
        let baseURL = '/s';
        this.sfdcBaseURL = baseURL.concat('/detail/',this.product.Id);
    }
}