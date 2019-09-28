jest.setTimeout(40000);
const Page = require('./helpers/page');

let page;

beforeEach(async () => {
    page = await Page.build();
    await page.goto('http://localhost:3000');
});

afterEach(async () => {
    await page.close();
});

describe('When logged in', async ()=>{
    beforeEach(async ()=>{
        await page.login();
        await page.click('a.btn-floating');
    });

    test('Can see create blog form', async () => {
        const label = await page.getContentsOf('form label');
        expect(label).toEqual('Blog Title');
    });

    describe('And using valid inputs', async ()=>{
        beforeEach(async ()=>{
            await page.type('input[name="title"]','Title text');
            await page.type('input[name="content"]','Content text');
            await page.click('form button');
        });

        test('Submitting takes user to review screen', async ()=>{
             const reviewText=await page.getContentsOf('form h5');
             expect(reviewText).toEqual('Please confirm your entries')
        });

        test('Submitting then saving adds blog to index page',async ()=>{
            await page.click('button.green');
            await page.waitFor('.card');

            const title=await page.getContentsOf('.card-content span');
            const content=await page.getContentsOf('.card-content p');

            expect(title).toEqual('Title text');
            expect(content).toEqual('Content text');

        })
    })

    describe('And using invalid inputs',async ()=>{
        beforeEach(async ()=>{
            await page.click('form button');
        });

        test('the form shows error message', async ()=>{
            const titleError=await page.getContentsOf('.title .red-text');
            const contentError=await page.getContentsOf('.content .red-text');;

            expect(titleError).toEqual('You must provide a value');
            expect(contentError).toEqual('You must provide a value');
        })
    })
});

describe('User is not logged in', async () => {
    // const actions=[
    //     {
    //         method:'get',
    //         path:'/api/blogs'
    //     },
    //     {
    //         method:'post',
    //         path:'/api/blogs',
    //         data:{
    //             title:'Title text',
    //             content:'Content text'
    //         }
    //     }
    // ];
     
    // test('Blog related actions are prohibited', async ()=>{
    //     const result= await page.evaluateRequests(actions);
    //     for(let res in result){
    //         expect(res).toEqual({error:'You must log in!'});
    //     }
    // })
    
    test('User cannot create blog post', async () => {

        const data={
            title: 'Title text',
            content: 'Content text'
        }
        const result = await page.post('/api/blogs',data)
        expect(result).toEqual({error:'You must log in!'});
    });
    test('User cannot get posts', async () => {
        const result = await page.get('/api/blogs');

        expect(result).toEqual({error:'You must log in!'});
    })
})