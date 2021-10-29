const { expect } = require("chai");

describe("Chime", function () {  
    let chime;
    let chimeContract;
    let addr1 = "0x09750ad360fdb7a2ee23669c4503c974d86d8694";
    let addr2 = "0xc915eC7f4CFD1C0A8Aba090F03BfaAb588aEF9B4";
    let addr3 = "0xecb6ffaC05D8b4660b99B475B359FE454c77D153";
    let addr4 = "0x7F85A82a2da50540412F6E526F1D00A0690a77B8";

    beforeEach(async function () {
        chime = await ethers.getContractFactory("Chime");
        chimeContract = await chime.deploy();

        chimeContract.addToList(addr1, "John", 1);
        chimeContract.addToList(addr2, "Samantha", 1);
        chimeContract.addToList(addr3, "Robert", 2);
        chimeContract.addToList(addr4, "Lynn", 2);
    });

        describe("Add user and check name", function () {
            it("should add a user with a name", async function() {
                expect(await chimeContract.getName(addr3)).equal("Robert");
                expect(await chimeContract.getName(addr1)).equal("John");
            });
        });

        describe("Remove users", function () {
            it("should remove a user", async function() {
                await chimeContract.removeFromList(addr3);
                expect(await chimeContract.getName(addr3)).equal("");
            });
        });
        
        describe("Check relationship", function () {
            it("relationship should be assigned", async function() {
                //Check if friend
                expect(await chimeContract.getRelationship(addr2)).equal(1);
                //Check if blocked
                expect(await chimeContract.getRelationship(addr4)).equal(2);
            });
        });
    
        //End
    });