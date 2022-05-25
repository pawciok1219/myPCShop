import { LightningElement } from 'lwc';
import MS_product_code from '@salesforce/label/c.MS_product_code';

export default class ProductCodeInput extends LightningElement {
    productCode='';

    label = {
        MS_product_code
    };
    
    handleKeyChange(event) {
        this.productCode = event.target.value;
        const nameEvent = new CustomEvent("getproductcode",{
            detail:this.productCode
        });
        this.dispatchEvent(nameEvent);
    }
}