import { LightningElement, api, track} from 'lwc';
import PRICE_FIELD from '@salesforce/schema/PricebookEntry.UnitPrice';
import ID_FIELD from '@salesforce/schema/PricebookEntry.Id';
import { updateRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import MS_success from '@salesforce/label/c.MS_success';
import MS_prices_updated_successfully from '@salesforce/label/c.MS_prices_updated_successfully';
import MS_advanced_price_editing from '@salesforce/label/c.MS_advanced_price_editing';
import MS_close from '@salesforce/label/c.MS_close';
import MS_specify_how_much_percent from '@salesforce/label/c.MS_specify_how_much_percent';
import MS_cancel from '@salesforce/label/c.MS_cancel';
import MS_save from '@salesforce/label/c.MS_save';
import MS_preview from '@salesforce/label/c.MS_preview';
import MS_specify_how_much_euro from '@salesforce/label/c.MS_specify_how_much_euro';
import MS_modified_products from '@salesforce/label/c.MS_modified_products';
import MS_product_name from '@salesforce/label/c.MS_product_name';
import MS_price from '@salesforce/label/c.MS_price';

export default class PricebookProductsEdit extends LightningElement {

    label = {
        MS_advanced_price_editing,
        MS_close,
        MS_specify_how_much_percent,
        MS_cancel,
        MS_save,
        MS_preview,
        MS_specify_how_much_euro,
        MS_modified_products,
        MS_product_name,
        MS_price
    };

    @api productsList = [];
    @track isModalOpen = true;
    @track tempProductList = [];
    @track percentNumber = 0;
    @track priceEuroNumber = 0;
    @track blockedPercent = false;
    @track blockedEuro = false;
    @track isLoading = false;

    connectedCallback(){
        this.tempProductList = this.productsList;
    }

    closeModal() {
        this.isModalOpen = false;
        this.handleChangeModalOpen();
    }

    handleChangeModalOpen(){
        const modalEvent = new CustomEvent("getmodalvalue", {detail:this.isModalOpen});
        this.dispatchEvent(modalEvent);
    }

    get column(){
        return cols;
    }

    saveRecordsUpdate(){
        this.isLoading = true;
        this.managerChangePrice();
        const fields = {};
        this.tempProductList.forEach(r=> {
            fields[ID_FIELD.fieldApiName] = r.Id;
            fields[PRICE_FIELD.fieldApiName] = r.UnitPrice;
            const recordInput = {
                fields: fields
            };
        updateRecord(recordInput).then((record) => {
          });
        });
        this.productsList = this.tempProductList;

        setTimeout(()=>{
            this.isLoading = false;
        },5000);

      this.dispatchEvent(
        new ShowToastEvent({
            title: MS_success,
            message: MS_prices_updated_successfully,
            variant: 'success'
        })
      );
        this.handleChangePrices();
        this.closeModal();
    }

    handleChangePrices(){
        const updatePrices = new CustomEvent("getupdatedprices", {detail:this.productsList});
        this.dispatchEvent(updatePrices);
    }

    handleChangePriceByPercent(){
        let tempList = [];
        this.tempProductList = this.productsList;
        this.tempProductList.forEach(r=> {
            let record = Object.assign({}, r);
            record.UnitPrice = Math.round(((this.percentNumber * (r.UnitPrice / 100)) + r.UnitPrice) *100)/100;
            tempList.push(record);
        });
        this.tempProductList = tempList;
    }

    handleChangePriceByEuro(){
        let tempList = [];
        this.tempProductList = this.productsList;
        this.tempProductList.forEach(r=> {
            let record = Object.assign({}, r);
            record.UnitPrice = Math.round((record.UnitPrice + Math.round(this.priceEuroNumber * 100)/100) * 100)/100;
            if(record.UnitPrice < 0){
                record.UnitPrice = 0;
            }
            tempList.push(record);
        });
        this.tempProductList = tempList;
    }

    managerChangePrice(){
        if(this.blockedPercent){
            this.handleChangePriceByEuro();
        }
        else{
            this.handleChangePriceByPercent();
        }
    }

    handleChangePriceOnInput(event){
        if(this.priceEuroNumber !== 0 || this.priceEuroNumber !== '' || this.priceEuroNumber !== undefined){
            this.blockedEuro = true;
            this.percentNumber = event.target.value;
        }
        if(event.target.value === 0 || event.target.value == '' || event.target.value == undefined){
            this.blockedEuro = false;
            this.percentNumber = event.target.value;
        }
    }

    handleChangePriceEuroOnInput(event){
        if(this.percentNumber !== 0 || this.percentNumber !== '' || this.percentNumber !== undefined){
            this.blockedPercent = true;
            this.priceEuroNumber = event.target.value;
        }
        if(event.target.value === 0 || event.target.value == '' || event.target.value == undefined){
            this.blockedPercent = false;
            this.priceEuroNumber = event.target.value;
        }
    }

}