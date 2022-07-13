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
import MS_order_successfully_placed from '@salesforce/label/c.MS_order_successfully_placed';
import MS_shipping from '@salesforce/label/c.MS_shipping';
import MS_please_enter_details from '@salesforce/label/c.MS_please_enter_details';
import MS_first_name from '@salesforce/label/c.MS_first_name';
import MS_last_name from '@salesforce/label/c.MS_last_name';
import MS_email from '@salesforce/label/c.MS_email';
import MS_phone from '@salesforce/label/c.MS_phone';
import MS_shipping_billing from '@salesforce/label/c.MS_shipping_billing';
import MS_shipping_address from '@salesforce/label/c.MS_shipping_address';
import MS_billing_address from '@salesforce/label/c.MS_billing_address';
import MS_payment_method from '@salesforce/label/c.MS_payment_method';
import MS_order_summary from '@salesforce/label/c.MS_order_summary';
import MS_total_amount_be_paid from '@salesforce/label/c.MS_total_amount_be_paid';
import MS_back_to_shopping_cart from '@salesforce/label/c.MS_back_to_shopping_cart';
import MS_place_order from '@salesforce/label/c.MS_place_order';
import MS_confirmation from '@salesforce/label/c.MS_confirmation';
import MS_are_you_sure_place_order from '@salesforce/label/c.MS_are_you_sure_place_order';

export default class CreateOrderForm extends NavigationMixin(LightningElement) {

    label = {
        MS_shipping,
        MS_please_enter_details,
        MS_first_name,
        MS_last_name,
        MS_email,
        MS_phone,
        MS_shipping_billing,
        MS_shipping_address,
        MS_billing_address,
        MS_payment_method,
        MS_order_summary,
        MS_total_amount_be_paid,
        MS_back_to_shopping_cart,
        MS_place_order,
        MS_confirmation,
        MS_are_you_sure_place_order
    };


    userId = Id;
    currentUserName;
    currentUserFirstName;
    currentUserLastName;
    currentUserPhone;
    currentUserEmail;
    contractId;
    sfdcBaseURL;
    shoppingCartUrl = '/s/shoppingcart';
    date;
    @track isModalOpen = false;
    @track isLoading = true;
    @track shippingSameBilling = false;
    @track productsCacheList = [];
    @track totalOrderPrice = 0;
    @wire(getAccount) accountId;
    @wire(getPricebook) standardPricebook;
    allFields;
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
        this.isModalOpen = true;
        createContract()
        .then(result => {
            this.contractId = result;
        })
        .catch(error => {})

        const fields = event.detail.fields;
        fields.AccountId = this.accountId.data;
        fields.Pricebook2Id = this.standardPricebook.data;
        fields.OwnerId = this.userId;
        fields.Status = 'Processing';
        fields.EffectiveDate = this.date;
        fields.ContractId = this.contractId;

        if(this.shippingSameBilling){
            fields.BillingCity = fields.ShippingCity;
            fields.BillingCountry = fields.ShippingCountry;
            fields.BillingPostalCode = fields.ShippingPostalCode;
            fields.BillingState = fields.ShippingState;
            fields.BillingStreet = fields.ShippingStreet;
        }
        this.allFields = fields;
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
                    message: MS_order_successfully_placed,
                    variant: 'success'
                })
            );
        },400);

        let baseURL = '/s';
        this.sfdcBaseURL = baseURL.concat('/order/',orderID);

        setTimeout(()=>{
            this[NavigationMixin.GenerateUrl]({
                type: 'standard__webPage',
                attributes: {
                    url: this.sfdcBaseURL
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

    handleCloseModal(event){
        this.isLoading = true;
        this.isModalOpen = false;
        let confirm = event.detail;
        if(confirm){
            this.template.querySelector('lightning-record-edit-form').submit(this.allFields);
        } else {
            this.isLoading = false;
        }
    }

}