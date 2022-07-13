import { LightningElement, track, wire } from 'lwc';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import Subject from '@salesforce/schema/Case.Subject';
import Description from '@salesforce/schema/Case.Description';
import Reason from '@salesforce/schema/Case.Reason';
import getProductsForUser from '@salesforce/apex/MS_CaseFormController.getProductsForUser';
import uploadFile from '@salesforce/apex/MS_CaseFormController.uploadFile';
import Id from '@salesforce/user/Id';
import CaseAssign from '@salesforce/apex/MS_CaseFormController.CaseAssign';
import MS_case_created from '@salesforce/label/c.MS_case_created';
import MS_dont_have_product from '@salesforce/label/c.MS_dont_have_product';
import MS_contact_customer_support from '@salesforce/label/c.MS_contact_customer_support';
import MS_tell_us_we_can_help from '@salesforce/label/c.MS_tell_us_we_can_help';
import MS_case_reason from '@salesforce/label/c.MS_case_reason';
import MS_product_v3 from '@salesforce/label/c.MS_product_v3';
import MS_subject_v2 from '@salesforce/label/c.MS_subject_v2';
import MS_description_v2 from '@salesforce/label/c.MS_description_v2';
import MS_submit from '@salesforce/label/c.MS_submit';
import MS_select_product from '@salesforce/label/c.MS_select_product';


export default class CaseForm extends NavigationMixin(LightningElement) {

    label = {
        MS_dont_have_product,
        MS_contact_customer_support,
        MS_tell_us_we_can_help,
        MS_case_reason,
        MS_product_v3,
        MS_subject_v2,
        MS_description_v2,
        MS_submit,
        MS_select_product
    };

    caseSubject = Subject;
    caseDescription = Description;
    caseReason = Reason;
    productValue;
    productPickList;
    @track isLoading = false;
    @track isModalOpen = false;
    @track uploadedFile = [];
    fileData;
    allFields;
    confirm = false;
    haveOrderProducts = false;
    
    openfileUpload(event) { 
        for(let i=0; i< event.target.files.length; i++){
            const file = event.target.files[i];
            let reader = new FileReader();
            reader.onload = () => {
                let base64 = reader.result.split(',')[1];
                this.fileData = {
                    'filename': file.name,
                    'base64': base64,
                }
                this.uploadedFile.push(this.fileData);
            }
            reader.readAsDataURL(file);
        }
    }

    handleDeleteFile(event){
        const tempFile = event.target.value;
        for (let i = this.uploadedFile.length - 1; i >= 0; i--) {
            if (this.uploadedFile[i].filename === tempFile) {
                this.uploadedFile.splice(i, 1);
            }
        }
    }
    
    @wire(getProductsForUser, { userId: Id})
    wiredResulted(result){
        const{data, error} = result;
            if(data){
                this.productPickList = Object.entries(data).map(([value,label]) => ({ value, label }));
                if(this.productPickList.length > 0){
                    this.haveOrderProducts = true;
                }else{
                    this.haveOrderProducts = false;
                }
            }
        if(error){
            this.dispatchEvent(
                new ShowToastEvent({
                    title:  error.body.message,
                    variant: 'error'
                })
            );
        }
    }

    handleGetProduct(event){
        this.productValue = event.target.value;
    }

    handleSuccess(event){
        if(this.confirm){
        this.handleReset();
        const createdRecord = event.detail.id;

        this.uploadedFile.forEach(element => {
            const {base64, filename} = element;
            uploadFile({ base64, filename, recordId: createdRecord})
            .then(result=>{
            })
        });

        CaseAssign({CaseIds: createdRecord})
        .then(result => {
        })
        .catch(error => {
        })

        this.dispatchEvent(
            new ShowToastEvent({
                title: MS_case_created,
                variant: 'success'
            })
        );

        let baseURL = '/s';
        this.sfdcBaseURL = baseURL.concat('/case/',createdRecord);

        setTimeout(()=>{
            this[NavigationMixin.GenerateUrl]({
                type: 'standard__webPage',
                attributes: {
                    url: this.sfdcBaseURL
                }
            }).then(generatedUrl => {
                window.open(generatedUrl,"_self");
            });
        },1500);
      }
    }

    handleSubmit(event){
        event.preventDefault();
        this.isModalOpen = true;
        const fields = event.detail.fields;
        fields.OwnerId = Id;
        fields.ProductId = this.productValue;
        fields.Origin = 'Email';
        if(fields.Reason == 'Delivery problem'){
            fields.Priority = 'High';
        }else{
            fields.Priority = 'Medium';
        }
        this.allFields = fields;
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
        this.confirm = event.detail;
        if(this.confirm){
            this.template.querySelector('lightning-record-edit-form').submit(this.allFields);
        } else {
            this.isLoading = false;
        }
    }

}