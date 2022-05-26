@IsTest
public with sharing class MS_EditRecordControllerTest {
    @TestSetup
    public static void testSetup(){
        Pricebook2 standartPricebook = new Pricebook2(Id=Test.getStandardPricebookId(), IsActive=true);
        update  standartPricebook;
        Product2 product = new Product2(Name='Test', IsActive=true,Producer__c='Intel');
        insert product;
        PricebookEntry standartPrice = new PricebookEntry(UnitPrice=1000,Product2Id=product.Id, Pricebook2Id=standartPricebook.Id,  IsActive=true);
        insert standartPrice;
        Pricebook2 customPB = new Pricebook2(Name='Custom Pricebook', IsActive=true);
        insert customPB;
        PricebookEntry customPrice = new PricebookEntry(Pricebook2Id=customPB.Id, Product2Id = product.Id, UnitPrice=20, IsActive=true);
        insert customPrice;
       
    }

    @IsTest
    public static void shouldGetStandardPriceProduct(){
        Product2 productTemp = [SELECT Id FROM Product2 LIMIT 1];
        PricebookEntry pricebookentryTemp = MS_EditRecordController.getStandardPriceProduct(productTemp.Id);
        System.assertEquals(1000, pricebookentryTemp.UnitPrice);
    }

    @IsTest
    public static void shouldUpdateStandartPriceProduct(){
        PricebookEntry pricebookentryTemp = [SELECT Id from PricebookEntry LIMIT 1];
        MS_EditRecordController.updateStandardPrice(pricebookentryTemp.Id, 130);
        PricebookEntry pricebookEntryAfterUpdate = [SELECT UnitPrice FROM PricebookEntry LIMIT 1];

        System.assertEquals(130,pricebookEntryAfterUpdate.UnitPrice);
    }

}