import { LightningElement } from 'lwc';

export default class ProductNameInput extends LightningElement {
    productName='';
    
    handleKeyChange(event) {
        this.productName = event.target.value;
        const nameEvent = new CustomEvent("getproductname",{
            detail:this.productName
        });
        this.dispatchEvent(nameEvent);
    }
}