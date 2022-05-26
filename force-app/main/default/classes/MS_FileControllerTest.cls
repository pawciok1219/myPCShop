@IsTest
public with sharing class MS_FileControllerTest {
    @TestSetup
    public static void testSetup(){
        Product2 productTest = new Product2(Name='CPU i5',Model__c='i5-4434',Producer__c='Intel',ProductCode='G88E',Available__c=true,Family='CPU', DisplayUrl='Test');
        insert productTest;

        List<Product2> listProduct = [SELECT id FROM Product2 LIMIT 1];
        String tempPr;
        for(Product2 product : listProduct){
            tempPr = product.Id;
        }

        ContentVersion content=new ContentVersion(); 
        content.Title='Header_Picture1'; 
        content.FirstPublishLocationId = tempPr;
        content.PathOnClient='/' + content.Title + '.jpg'; 
        Blob bodyBlob=Blob.valueOf('Unit Test ContentVersion Body'); 
        content.VersionData=bodyBlob; 
        insert content;
    }

    @IsTest
    public static void shouldReturnTrueDisplayUrl(){
        List<Product2> listProduct = [SELECT id FROM Product2 LIMIT 1];
        String tempPr;
        for(Product2 product : listProduct){
            tempPr = product.Id;
        }
        Boolean tempTest = MS_FileController.haveDisplayUrl(tempPr, 'Test');
        System.assertEquals(true, tempTest);
    }

    @IsTest
    public static void shouldReturnFalseDisplayUrl(){
        List<Product2> listProduct = [SELECT id FROM Product2 LIMIT 1];
        String tempPr;
        for(Product2 product : listProduct){
            tempPr = product.Id;
        }
        Boolean tempTest = MS_FileController.haveDisplayUrl(tempPr, 'yes');
        System.assertEquals(false, tempTest);
    }

    @IsTest
    public static void shouldReturnListVersionFilesDisplayUrl(){
        List<Product2> listProduct = [SELECT id FROM Product2 LIMIT 1];
        String tempPr;
        for(Product2 product : listProduct){
            tempPr = product.Id;
        }
        List <ContentVersion> tempList = MS_FileController.getVersionFiles(tempPr);
        System.assertEquals(1, tempList.size());

    }

    @IsTest
    public static void shouldNotReturnListVersionFilesDisplayUrl(){
        List <ContentVersion> tempList = MS_FileController.getVersionFiles('tempPr');
        System.assertEquals(0, tempList.size());
    }
}