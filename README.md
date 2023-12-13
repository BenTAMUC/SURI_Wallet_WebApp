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

clean up code
add comments
make sure dids are valid
    quick test with jwt signing 
    test did validity by finding tool
database structure:
    key db
    did db
        will contain profile contents
    sigchain db
orbitdb did support??? 
    find out how orbit supports users

Using the documents database requires there to be an "_id" object within the JSON to be accepted, will need to change did/vc/sc specs to compensate for that.

Asks for:
    name, url, bio
Generates DID, making keys in the background
Displayes the DID _id that will be used to get did from db
Generate First Sighchain Link for new keys