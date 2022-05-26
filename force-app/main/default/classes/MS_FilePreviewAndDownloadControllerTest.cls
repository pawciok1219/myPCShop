@IsTest
public with sharing class MS_FilePreviewAndDownloadControllerTest {

    @TestSetup
    public static void testSetup() {
        Product2 productTest = new Product2(Name='CPU i5',Model__c='i5-4434',Producer__c='Intel',ProductCode='G88E',Available__c=true,Family='CPU');
        insert productTest;

        ContentVersion content=new ContentVersion(); 
        content.Title='Header_Picture1'; 
        content.PathOnClient='/' + content.Title + '.jpg'; 
        Blob bodyBlob=Blob.valueOf('Unit Test ContentVersion Body'); 
        content.VersionData=bodyBlob; 
        insert content;

        ContentDocumentLink cdLink1 = new ContentDocumentLink();
        cdLink1.LinkedEntityId = productTest.Id;
        cdLink1.contentdocumentid = [select contentdocumentid from contentversion where id =: content.id].contentdocumentid;
        cdLink1.ShareType = 'I';
        cdLink1.Visibility = 'AllUsers'; 
        insert cdLink1;
    }

    @IsTest
    public static void shouldReturnMapWithFilesByRecordId() {
        Product2 product = [SELECT Id, Name, Model__c, Producer__c, ProductCode, Available__c, Family FROM Product2 WHERE ProductCode='G88E'];

        List<ContentDocumentLink> files = [SELECT ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId = :product.Id];
        List<ID> fileIDs = new List<ID>();
        for (ContentDocumentLink docLink : files) {
            fileIDs.add(docLink.ContentDocumentId);
        }
 
        List<ContentVersion> docs = [SELECT Id,ContentDocumentId, FileExtension, Title 
            FROM ContentVersion WHERE ContentDocumentId IN : fileIDs];
        Map<Id, ContentVersion> mapIdTitle = new Map<Id, ContentVersion>(docs);
        Map<Id, ContentVersion> mapFromMethod = MS_FilePreviewAndDownloadController.getRelatedFilesByRecordId(product.Id);

        System.assertEquals(mapIdTitle,mapFromMethod);
    }

    @IsTest
    public static void shouldContentDocumentByRecordId() {
        Product2 product = [SELECT Id, Name, Model__c, Producer__c, ProductCode, Available__c, Family FROM Product2 WHERE ProductCode='G88E'];
        ContentDocumentLink file = [SELECT Id, ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId = :product.Id];
        MS_FilePreviewAndDownloadController.deleteContentDocument(file.ContentDocumentId);
        System.assert(file.ContentDocumentId!=null);
    }

    @IsTest
    public static void shouldUpdateDisplayURL() {
        Product2 product = [SELECT Id, Name, Model__c, Producer__c, ProductCode, Available__c, Family, DisplayUrl FROM Product2 WHERE ProductCode='G88E'];
        MS_FilePreviewAndDownloadController.updateDisplayURL(product.Id,'testurl');
        Product2 productAfterUpdate = [SELECT Id, Name, Model__c, Producer__c, ProductCode, Available__c, Family, DisplayUrl FROM Product2 WHERE ProductCode='G88E'];
        System.assertEquals('testurl',productAfterUpdate.DisplayUrl);
    }

    @IsTest
    public static void shouldDeleteAllFilesByRecordId() {
        Product2 product = [SELECT Id, Name, Model__c, Producer__c, ProductCode, Available__c, Family, DisplayUrl FROM Product2 WHERE ProductCode='G88E'];
        MS_FilePreviewAndDownloadController.deleteAllFilesByRecordId(product.Id);
        List<ContentDocumentLink> files = [SELECT ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId = :product.Id];
        System.assertEquals(0,files.size());
    }

}