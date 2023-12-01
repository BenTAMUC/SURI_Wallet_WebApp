SURI Wallet Web App

Dev Instructions After Cloning:
    1. cd SURI_Wallet_WebApp
    2. npm install (installs node_modules)
    3. npm run dev (local host of web page)

James Presentation:
    After doing the command on step 2, you 
    can either push f12 or right click and select 
    the 'inspect' option to view the in browser dev
    screen. (this was using google chrome)
    Click on the 'console' tab to view output
    Click the 'Create DID' button
    You should see in the consol output, in this order:
        1. Created DID
        2. A bunch of warnings on deprecated utilities, im working on that
        3. Gun2, click arrow to expand its contents
            1. click the arrow next to 'root'
            2. click the arrow next to 'graph'
            3. you should notice the individual DID objects from the JSON array

I had to use a function that seperated the array elements in the DID doc into seperate objects
GUN DB doesnt like storing an array of objects, this was mainly a test on if i could get a DID stored in a local gun db