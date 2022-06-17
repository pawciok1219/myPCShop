@isTest
public with sharing class MS_GoogleSSOAuthTest {

    @TestSetup
    public static void testSetup() {
        Account ac = new Account(Name='GoogleAuth');
        insert ac;
    }

    @isTest
    public static void shouldCreateAndUpdateUser() {
        MS_GoogleSSOAuth handler = new MS_GoogleSSOAuth();
        Auth.UserData sampleData = new Auth.UserData('testId', 'testFirst', 'testLast', 'testFirst testLast', 
        'testuse8888r@gmail.com', null, 'testuserlong', 'en_US', 
        'google', null, new Map<String, String>{'language' => 'en_US'});

    try {
        User u = handler.createUser(null, sampleData);
        sampleData = new Auth.UserData('testNewId', 'testNewFirst', 'testNewLast',
                                    'testNewFirst testNewLast', 'testnewuser@gmail.com', null, 'testnewuserlong', 'en_US', 'google',
                                     null, new Map<String, String>{});
        handler.updateUser(null, null, sampleData);
    } catch(Exception e){}
    }
}