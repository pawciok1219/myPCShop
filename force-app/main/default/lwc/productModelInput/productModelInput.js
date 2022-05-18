import { LightningElement } from 'lwc';

export default class ProductModelInput extends LightningElement {
    productModel='';
    
    handleKeyChange(event) {
        this.productModel = event.target.value;
        const nameEvent = new CustomEvent("getproductmodel",{
            detail:this.productModel
        });
        this.dispatchEvent(nameEvent);
    }
}