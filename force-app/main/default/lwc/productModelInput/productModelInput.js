import { LightningElement } from 'lwc';
import MS_model from '@salesforce/label/c.MS_model';

export default class ProductModelInput extends LightningElement {
    productModel='';

    label = {
        MS_model
    };
    
    handleKeyChange(event) {
        this.productModel = event.target.value;
        const nameEvent = new CustomEvent("getproductmodel",{
            detail:this.productModel
        });
        this.dispatchEvent(nameEvent);
    }
}