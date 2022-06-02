import { LightningElement, track, wire, api } from 'lwc';
import getPricebooksProduct from '@salesforce/apex/MS_GetProductsFromPricebook.getProducts';
import { refreshApex } from "@salesforce/apex";
import MS_name from '@salesforce/label/c.MS_name';
import MS_price from '@salesforce/label/c.MS_price';
import MS_error from '@salesforce/label/c.MS_error';
import MS_pricebook_not_contain_product from '@salesforce/label/c.MS_pricebook_not_contain_product';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { updateRecord } from 'lightning/uiRecordApi';
import MS_price_updated_success from '@salesforce/label/c.MS_price_updated_success';
import MS_success from '@salesforce/label/c.MS_success';
import MS_advanced_price_editing from '@salesforce/label/c.MS_advanced_price_editing';

const cols = [
    { label: MS_name, fieldName:'Name', type: 'text'},
    { label: MS_price, fieldName:'UnitPrice',   type: 'currency', editable: true, sortable: true,
    typeAttributes: { currencyCode: 'EUR', step: '0.01' },
    cellAttributes: { alignment: 'center' }},
];

export default class PricebookDetailPagePricebookProduct extends LightningElement {

    label = {
        MS_pricebook_not_contain_product,
        MS_advanced_price_editing
    };

    disableBool = true;
    fldsItemValues = [];
    @track selectedRows = [];
    @track pricebooksProduct =[];
    @api recordId;
    wiredActivities;
    @track isEmpty;
    @track modalTemplateOpen = false;
    sortedBy;
    defaultSortDirection = 'asc';
    sortDirection = 'asc';

    @wire(getPricebooksProduct, {recordId: '$recordId'})
    wiredResulted(result){ 
        const {data, error} = result;
        this.wiredActivities = result;
        this.pricebooksProduct = [];
        if(data){
            data.forEach(r=> {
                let record = Object.assign({}, r);
                record.Name = r.Product2.Name;
                this.pricebooksProduct.push(record);
            });
            refreshApex(this.wiredActivities);
        }
        if(error){ 
            this.dispatchEvent(
                new ShowToastEvent({
                    title: MS_error,
                    message: error.body.message,
                    variant: 'error',
                }),
            );
        }
    }

    get column(){
        return cols;
    }

    saveHandleAction(event) {
        this.fldsItemValues = event.detail.draftValues;
        const inputsItems = this.fldsItemValues.slice().map(draft => {
            const fields = Object.assign({}, draft);
            return { fields };
        });
 
        const promises = inputsItems.map(recordInput => updateRecord(recordInput));
        Promise.all(promises).then(res => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: MS_success,
                    message: MS_price_updated_success,
                    variant: 'success'
                })
            );
            this.fldsItemValues = [];
            return this.refresh();
        }).catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: MS_error,
                    message: error.body.message,
                    variant: 'error'
                })
            );
        }).finally(() => {
            this.fldsItemValues = [];
        });
    }

    async refresh() {
        await refreshApex(this.wiredActivities);
    }

    onHandleSort( event ) {
        const { fieldName: sortedBy, sortDirection } = event.detail;
        const cloneData = [...this.pricebooksProduct];

        cloneData.sort( this.sortBy( sortedBy, sortDirection === 'asc' ? 1 : -1 ) );
        this.pricebooksProduct = cloneData;
        this.sortDirection = sortDirection;
        this.sortedBy = sortedBy;
    }

    sortBy( field, reverse, primer ) {
        const key = primer
            ? function( x ) {
                  return primer(x[field]);
              }
            : function( x ) {
                  return x[field];
              };

        return function( a, b ) {
            a = key(a);
            b = key(b);
            return reverse * ( ( a > b ) - ( b > a ) );
        };
    }

    getSelected() {
        this.selectedRows = [];
        this.selectedRows = this.template.querySelector('lightning-datatable').getSelectedRows();
    }

    openEditPriceModal(){
        this.getSelected();
        this.modalTemplateOpen = true;
    }

    handleSelected(event){
        const selectedRows = event.detail.selectedRows;
        if ( selectedRows.length > 0 ) {
            this.disableBool = false;
        } else {
            this.disableBool = true;
        }
    }

    handleChangeModalOpen(event){
        this.modalTemplateOpen = event.detail;
    }

    handleUpdatePrices(event){
        this.pricebooksProduct = (this.pricebooksProduct).map(obj => (event.detail).find(o => o.Id === obj.Id) || obj);
    }

}