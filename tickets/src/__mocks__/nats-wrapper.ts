export const natsWrapper =  {
    client: {
        // client have publish function in base publisher
        publish: jest.fn().mockImplementation(
            (subject: string, data: string, callback: () => void) => {
                callback();
            }
        )
    }
}