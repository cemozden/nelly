describe('Environment Variables', () =>{
    test('APPLICATION_DIR variable exist', () => {
        expect(process.env.APPLICATION_DIR).not.toBeUndefined();
    });
});