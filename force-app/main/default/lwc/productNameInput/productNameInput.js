import { LightningElement } from 'lwc';
import MS_product_name from '@salesforce/label/c.MS_product_name';

export default class ProductNameInput extends LightningElement {

    label = {
        MS_product_name
    };

    productName='';
    
    handleKeyChange(event) {
        this.productName = event.target.value;
        const nameEvent = new CustomEvent("getproductname",{
            detail:this.productName
        });
        this.dispatchEvent(nameEvent);
    }
}