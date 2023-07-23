pragma solidity ^0.5.0;

contract Adoption {
    address public owner;
    address[16] public adopters;
    // Adopting a pet
    function adopt(uint petId) public returns (uint) {
        require(petId >= 0 && petId <= 15);

        adopters[petId] = msg.sender;

        return petId;
    }
    // Retrieving the adopters
    function getAdopters() public view returns (address[16] memory) {
        return adopters;
    }

    // Reset adoption status for all pets
    function resetAdoptionStatus() public {
        // require(msg.sender == owner, "Only the owner can reset the adoption status.");
        
        for (uint i = 0; i < 16; i++) {
            adopters[i] = 0x0000000000000000000000000000000000000000;
        }
    }

}
