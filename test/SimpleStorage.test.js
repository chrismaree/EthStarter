var SimpleStorage = artifacts.require("./SimpleStorage.sol");

contract('SimpleStorage', function(accounts) {

    const account0 = accounts[0];

    it('can set values', async () => {
        
        const startingValue = 3;
        
        let simpleStorage = await SimpleStorage.new(startingValue);

        const setConstructorValue = await simpleStorage.get({from: account0});
        
        assert.equal(startingValue, setConstructorValue, 'Constructor value not set correctly');

        const testValue = 5;
        
        simpleStorage.set(testValue,{from:account0});

        const setValue = await simpleStorage.get({from:account0});

        assert.equal(testValue, setValue, 'Set Value is not same as get value');
    })
});