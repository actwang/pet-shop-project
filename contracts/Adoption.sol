pragma solidity ^0.5.0;

contract Adoption {
    address public owner;
    address[16] public adopters;
    string public mostAdoptedBreed;

    struct VaccinationRecord {
        string vaccineName;
        string date;
    }
    mapping(uint256 => VaccinationRecord) public vaccinationRegistry;

    constructor() public {
        // Hard-code the vaccination history for all pets
        vaccinationRegistry[0] = VaccinationRecord("DAP*-2021.01.23", "January 23, 2022"); // January 23, 2022 
        vaccinationRegistry[1] = VaccinationRecord("DAP*-2021.02.23", 'June 20, 2023 ');
        vaccinationRegistry[2] = VaccinationRecord("DAP*-2021.03.23", 'July 25, 2023');
        vaccinationRegistry[3] = VaccinationRecord("Rabies**-2022.03.23", 'May 15, 2023 ');

        vaccinationRegistry[4] = VaccinationRecord("SomeVaccine-2022.04.10", 'May 15, 2023 ');
        vaccinationRegistry[5] = VaccinationRecord("AnotherVaccine-2022.05.15", 'May 15, 2023 '); // May 15, 2023 
        vaccinationRegistry[6] = VaccinationRecord("VetVaccine-2022.06.20", ' June 20, 2023 '); // June 20, 2023 
        vaccinationRegistry[7] = VaccinationRecord("PetGuard-2022.07.25", 'July 25, 2023'); // July 25, 2023

        // Continue setting records for pets 8 to 15...
        vaccinationRegistry[8] = VaccinationRecord("DAP*-2021.01.23", 'July 25, 2023');
        vaccinationRegistry[9] = VaccinationRecord("DAP*-2021.02.23", ' July 25, 2023');
        vaccinationRegistry[10] = VaccinationRecord("DAP*-2021.03.23", ' July 25, 2023'); 
        vaccinationRegistry[11] = VaccinationRecord("Rabies**-2022.03.23", ' July 25, 2023'); 

        vaccinationRegistry[12] = VaccinationRecord("SomeVaccine-2022.04.10", ' July 25, 2023');
        vaccinationRegistry[13] = VaccinationRecord("AnotherVaccine-2022.05.15", ' July 25, 2023'); 
        vaccinationRegistry[14] = VaccinationRecord("VetVaccine-2022.06.20", ' July 25, 2023'); 
        vaccinationRegistry[15] = VaccinationRecord("PetGuard-2022.07.25", ' July 25, 2023'); 
    }
    // Get vaccination record for a pet
    function getVaccinationRecord(uint petId) public view returns (string memory, string memory) {
        require(petId >= 0 && petId <= 15);

        VaccinationRecord memory record = vaccinationRegistry[petId];
        return (record.vaccineName, record.date);
    }

    // Set the most adopted breed
    function setMostAdoptedBreed(string memory breed) public   {
        // Update the mostAdoptedBreed state variable with the new value
        mostAdoptedBreed = breed;
    }

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
