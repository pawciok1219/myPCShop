import { LightningElement, wire, track } from 'lwc';
import Id from '@salesforce/user/Id';
import { NavigationMixin } from 'lightning/navigation';
import getItemsFromCache from '@salesforce/apex/MS_ShoppingCartController.getItemsFromCache';
import getPricebook from '@salesforce/apex/MS_ShoppingCartController.getPricebook';
import getAccount from '@salesforce/apex/MS_ShoppingCartController.getAccount';
import createContract from '@salesforce/apex/MS_ShoppingCartController.createContract';
import parseWrapperToSObject from '@salesforce/apex/MS_ShoppingCartController.parseWrapperToSObject';
import deleteAllProductsFromCache from '@salesforce/apex/MS_ShoppingCartController.deleteAllProductsFromCache';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord } from 'lightning/uiRecordApi';
import UserNameFld from '@salesforce/schema/User.Name';
import UserFirstNameFld from '@salesforce/schema/User.FirstName';
import UserLastNameFld from '@salesforce/schema/User.LastName';
import UserEmailFld from '@salesforce/schema/User.Email';
import UserPhoneFld from '@salesforce/schema/User.Phone';


export default class CreateOrderForm extends NavigationMixin(LightningElement) {

    userId = Id;
    currentUserName;
    currentUserFirstName;
    currentUserLastName;
    currentUserPhone;
    currentUserEmail;
    contractId;
    shoppingCartUrl = '/s/shoppingcart';
    date;
    @track isLoading = true;
    @track shippingSameBilling = false;
    @track productsCacheList = [];
    @track totalOrderPrice = 0;
    @wire(getAccount) accountId;
    @wire(getPricebook) standardPricebook;
    error;

    connectedCallback(){
        let today = new Date();
        this.date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    }

    @wire(getItemsFromCache)
    wiredItemsResulted(result){
        const {data, error} = result;
        this.wiredItems = result;
        this.productsCacheList = [];
        if(data){
            data.forEach(r=> {
                let record = Object.assign({}, r);
                record.total = r.quantity * r.UnitPrice;
                this.productsCacheList.push(record);
            });
            this.getOrderTotalPrice();
            setTimeout(()=>{
                this.isLoading = false;
            },500);
        }
        if(error){ 
            this.dispatchEvent(
                new ShowToastEvent({
                    title: MS_error,
                    message: error.body.message,
                    variant: 'error',
                }),
            );
            this.isLoading = false;
        }
    }

    getOrderTotalPrice(){
        this.totalOrderPrice = 0;
        this.productsCacheList.forEach(r=> {
            this.totalOrderPrice = this.totalOrderPrice + r.total;
        });
    }

    @wire(getRecord, { recordId: Id, fields: [UserNameFld, UserFirstNameFld, UserLastNameFld, UserEmailFld, UserPhoneFld]}) 
    userDetails({error, data}) {
        if (data) {
            this.currentUserName = data.fields.Name.value;
            this.currentUserFirstName = data.fields.FirstName.value;
            this.currentUserLastName = data.fields.LastName.value;
            this.currentUserPhone = data.fields.Phone.value;
            this.currentUserEmail = data.fields.Email.value;
        } else if (error) {
            this.error = error ;
        }
    }

    handleShippingBillingCheckbox(event){
        this.shippingSameBilling = event.target.checked;
    }

    handleSubmit(event){
        this.isLoading = true;
        createContract()
        .then(result => {
            this.contractId = result;
        })
        .catch(error => {})

        const fields = event.detail.fields;
        fields.AccountId = this.accountId.data;
        fields.Pricebook2Id = this.standardPricebook.data;
        fields.OwnerId = this.userId;
        fields.Status = 'Draft';
        fields.EffectiveDate = this.date;
        fields.ContractId = this.contractId;

        if(this.shippingSameBilling){
            fields.BillingCity = fields.ShippingCity;
            fields.BillingCountry = fields.ShippingCountry;
            fields.BillingPostalCode = fields.ShippingPostalCode;
            fields.BillingState = fields.ShippingState;
            fields.BillingStreet = fields.ShippingStreet;
        }
        this.template.querySelector('lightning-record-edit-form').submit(fields);
    }

    handleSuccess(event){
        this.handleReset();
        const orderID = event.detail.id;
        this.productsCacheList.forEach(element => {
            parseWrapperToSObject({orderWrapper: element, orderId: orderID })
            .then(result => {
            })
            .catch(error => {
            })
        });
  
        deleteAllProductsFromCache().then(() => {
            refreshApex(this.wiredItems);
        })

        setTimeout(()=>{
            this.dispatchEvent(
                new ShowToastEvent({
                    message: 'The order has been successfully placed!',
                    variant: 'success'
                })
            );
        },400);

        setTimeout(()=>{
            setTimeout(()=>{
                this.isLoading = false;
            },300);
            this[NavigationMixin.GenerateUrl]({
                type: 'standard__webPage',
                attributes: {
                    url: '/s/'
                }
            }).then(generatedUrl => {
                window.open(generatedUrl,"_self");
            });
        },1300);
    }

    handleReset() {
        const inputFields = this.template.querySelectorAll('lightning-input-field');
        if (inputFields) {
            inputFields.forEach(field => { field.reset(); });
        }
    }

}