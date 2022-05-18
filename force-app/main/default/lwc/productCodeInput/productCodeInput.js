import { LightningElement } from 'lwc';

export default class ProductCodeInput extends LightningElement {
    productCode='';
    
    handleKeyChange(event) {
        this.productCode = event.target.value;
        const nameEvent = new CustomEvent("getproductcode",{
            detail:this.productCode
        });
        this.dispatchEvent(nameEvent);
    }
}