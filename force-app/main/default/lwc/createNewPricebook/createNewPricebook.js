import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import updateActivityPricebookById from '@salesforce/apex/MS_NewPricebookController.updateActivityPricebookById';
import MS_pricebook_created_success from '@salesforce/label/c.MS_pricebook_created_success';
import MS_pricebook_created from '@salesforce/label/c.MS_pricebook_created';
import MS_error_update_active from '@salesforce/label/c.MS_error_update_active';
import MS_error_creating_pricebook from '@salesforce/label/c.MS_error_creating_pricebook';
import MS_enddate_gt_startdate from '@salesforce/label/c.MS_enddate_gt_startdate';
import MS_close from '@salesforce/label/c.MS_close';
import MS_cancel from '@salesforce/label/c.MS_cancel';
import MS_save_and_new from '@salesforce/label/c.MS_save_and_new';
import MS_save from '@salesforce/label/c.MS_save';
import MS_new_pricebook from '@salesforce/label/c.MS_new_pricebook';


export default class CreateNewPricebook extends LightningElement {

    label = {
        MS_close,
        MS_cancel,
        MS_save_and_new,
        MS_save,
        MS_new_pricebook
    };

    @track isLoading = false;
    @track isModalOpen = true;
    @track isSaveAndNew = false;
    

    handleSubmit(event){
        this.isLoading = true;
        event.preventDefault();
        this.template.querySelector('lightning-record-edit-form').submit(this.fields);
    }

    handleSaveAndNew(event){
        this.isLoading = true;
        event.preventDefault();
        this.template.querySelector('lightning-record-edit-form').submit(this.fields);
        this.isSaveAndNew = true;
    }

    handleReset() {
        this.isLoading = true;
        const formInputFields = this.template.querySelectorAll('lightning-input-field');
        if (formInputFields) {
            formInputFields.forEach(field =>{
                field.reset();
            })
        }
        setTimeout(()=>{
            this.isLoading = false;
        },800);
    }

    handleSuccess(event){
        const Id = event.detail.id;
        const toastEvent = new ShowToastEvent ({
            title: MS_pricebook_created_success,
            message: MS_pricebook_created +' '+ Id,
            variant: "success"
        });
        this.dispatchEvent(toastEvent);

        updateActivityPricebookById({pricebookId: Id})
        .then(result => {
        })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: MS_error_update_active,
                    message: error.body.message,
                    variant: 'error',
                }),
            );
        });
        setTimeout(()=>{
            this.isLoading = false;
        },5000);
        if(this.isSaveAndNew === true){
            this.handleReset();
            this.isSaveAndNew = false;
        }else{
            this.closeModal();
        }
    }

    handleChangeModalOpen(){
        const modalEvent = new CustomEvent("getmodalvalue", {detail:this.isModalOpen});
        this.dispatchEvent(modalEvent);
    }

    handleError(){
        this.template.querySelectorAll('lightning-input-field').forEach(element => console.log(element.reportValidity()));
        const toastEvent = new ShowToastEvent ({
            title: MS_error_creating_pricebook,
            message: MS_enddate_gt_startdate,
            variant: "error"
        });
        this.dispatchEvent(toastEvent);
        setTimeout(()=>{
            this.isLoading = false;
        },5000);
        eval("$A.get('e.force:refreshView').fire();");
    }

    closeModal() {
        this.isModalOpen = false;
        this.handleChangeModalOpen();
    }

}