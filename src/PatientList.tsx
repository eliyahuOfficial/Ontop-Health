import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from 'flowbite-react';
import { saveAs } from 'file-saver';

interface Patient {
    userID: string;
    patientID: string;
    patientName: string;
    patientDOB: string;
    patientGender: string;
    patientZipCode: string;
    providers: string;
    providerURL: string;
    treatmentDate: string;
    startTime: string;
    endTime: string;
    features: string;
}

interface PatientsData {

    eCW: Patient[];
    AMD: Patient[];
    Quest: Patient[];
    Behavidance: Patient[];
}

const PatientList: React.FC = () => {
    const [patients, setPatients] = useState<PatientsData | null>(null);
    const [searchName, setSearchName] = useState<string>('');
    const [searchDOB, setSearchDOB] = useState<string>('');
    const [searchGender, setSearchGender] = useState<string>('');
    const [searchZipCode, setSearchZipCode] = useState<string>('');
    const [selectedPatients, setSelectedPatients] = useState<Patient[]>([]);
    const [mergedPatient, setMergedPatient] = useState<Patient | null>(null);
    const [showAdvancedSearch, setShowAdvancedSearch] = useState<boolean>(false);
    const [filteredPatients, setFilteredPatients] = useState<PatientsData | null>(null);

    useEffect(() => {
        axios.get('/patients.json')
            .then(response => {
                console.log('Patients fetched successfully:', response.data);
                setPatients(response.data);
                setFilteredPatients(response.data);
            })
            .catch(error => {
                console.error('Error fetching patients:', error);
            });
    }, []);

    const searchPatients = () => {
        if (!patients) return;

        setMergedPatient(null); ///
        const allPatients = [
            ...patients.eCW,
            ...patients.AMD,
            ...patients.Quest,
            ...patients.Behavidance
        ];

        const matchingPatients = allPatients.filter(patient =>
            (searchName === '' || patient.patientName.toLowerCase().includes(searchName.toLowerCase())) &&
            (searchDOB === '' || patient.patientDOB.includes(searchDOB)) &&
            (searchGender === '' || patient.patientGender.toLowerCase().includes(searchGender.toLowerCase())) &&
            (searchZipCode === '' || patient.patientZipCode.includes(searchZipCode))
        );


        const filteredData: PatientsData = {
            eCW: matchingPatients.filter(p => p.providers.includes('eCW')),
            AMD: matchingPatients.filter(p => p.providers.includes('AMD')),
            Quest: matchingPatients.filter(p => p.providers.includes('Quest')),
            Behavidance: matchingPatients.filter(p => p.providers.includes('Behavidance')),
        };
        setFilteredPatients(filteredData);
    }

    const togglePatientSelection = (patient: Patient) => {
        if (selectedPatients.includes(patient)) {
            setSelectedPatients(selectedPatients.filter(p => p !== patient));
        } else {
            setSelectedPatients([...selectedPatients, patient]);
        }
    }

    const mergePatients = () => {
        if (selectedPatients.length > 0) {
            const uniquePatientNames = [...new Set(selectedPatients.map(p => p.patientName))];
            const mergedPatient = {
                userID: generateUniqueID(),
                patientID: selectedPatients.map(p => p.patientID).join(', '),
                patientName: uniquePatientNames.join(', '),
                patientDOB: selectedPatients[0].patientDOB,
                patientGender: selectedPatients[0].patientGender,
                patientZipCode: selectedPatients[0].patientZipCode,
                providers: selectedPatients.map(p => p.providers).join(', '),
                providerURL: selectedPatients.map(p => p.providerURL).join(', '),
                treatmentDate: new Date().toISOString().split('T')[0],
                startTime: new Date().toISOString(),
                endTime: new Date().toISOString(),
                features: selectedPatients.map(p => p.features).join(', ')
            };
            setMergedPatient(mergedPatient);





            const blob = new Blob([JSON.stringify(mergedPatient, null, 2)], { type: 'application/json' });
            saveAs(blob, 'oontop.json');

            setSelectedPatients([]);

        } else {
            setMergedPatient(null);
        }
    }

    const generateUniqueID = () => {
        return 'xxxxxx'.replace(/[x]/g, () => (Math.random() * 16 | 0).toString(16));
    }

    return (
        <div className="mt-6 max-w-screen-2xl mx-auto flex flex-row gap-4">
            <div className="flex-2">
                <div className="flex flex-col gap-3">
                    <input
                        type="text"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        placeholder="Search by name"
                        className="py-2 px-6 border rounded-md"
                    />
                    {showAdvancedSearch && (
                        <>
                            <input
                                type="text"
                                value={searchDOB}
                                onChange={(e) => setSearchDOB(e.target.value)}
                                placeholder="Search by date of birth (YYYY-MM-DD)"
                                className="py-2 px-6 border rounded-md"
                            />
                            <input
                                type="text"
                                value={searchGender}
                                onChange={(e) => setSearchGender(e.target.value)}
                                placeholder="Search by gender"
                                className="py-2 px-6 border rounded-md"
                            />
                            <input
                                type="text"
                                value={searchZipCode}
                                onChange={(e) => setSearchZipCode(e.target.value)}
                                placeholder="Search by zip code"
                                className="py-2 px-6 border rounded-md"
                            />
                        </>
                    )}
                    <Button onClick={() => setShowAdvancedSearch(!showAdvancedSearch)} gradientDuoTone="blueToPurple" className="border">
                        {showAdvancedSearch ? 'Hide Advanced Search' : 'Show Advanced Search'}
                    </Button>
                    <Button onClick={searchPatients} gradientDuoTone="purpleToBlue" className="border">
                        Search
                    </Button>
                    <Button onClick={mergePatients} gradientDuoTone="purpleToBlue" className="border">
                        Merge
                    </Button>

                </div>

                {mergedPatient && (
                    <div className="w-52 my-8">
                        <h2 className='text-2xl font-semibold mb-2'>Merged Patient</h2>
                        <div className="flex flex-col gap-4">
                            <div className="border p-4 rounded-md">
                                <h3>Patient ID</h3>
                                <p>{mergedPatient.patientID}</p>
                            </div>
                            <div className="border p-4 rounded-md">
                                <h3>Patient Name</h3>
                                <p>{mergedPatient.patientName}</p>
                            </div>
                            <div className="border p-4 rounded-md">
                                <h3>Providers:</h3>
                                <p>{mergedPatient.providers}</p>
                            </div>
                            <div className="border p-4 rounded-md">
                                <h3>Provider URLs:</h3>
                                <p>{mergedPatient.providerURL}</p>
                            </div>
                            <div className="border p-4 rounded-md">
                                <h3>Patient New ID:</h3>
                                <p>{mergedPatient.userID}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="flex-1 overflow-auto">
                <div className="flex flex-wrap border rounded-md">
                    {filteredPatients && Object.keys(filteredPatients).map(groupKey => (
                        <div
                            key={groupKey}
                            className="border border-gray-200 rounded-lg  w-full xl:w-1/4 max-h-[calc(100vh-8rem)] overflow-y-auto"
                        >
                            <h2 className="text-xl font-semibold">{groupKey}</h2>
                            <div className="flex flex-col gap-2">
                                {filteredPatients[groupKey as keyof PatientsData].map(patient => (
                                    <div
                                        key={patient.patientID}
                                        className="border rounded-md p-4 flex justify-between items-center"
                                    >
                                        <div>
                                            <h3 className="font-semibold">{patient.patientName}</h3>
                                            <p>ID: {patient.patientID}</p>
                                            <p>DOB: {patient.patientDOB}</p>
                                            <p>Gender: {patient.patientGender}</p>
                                            <p>Zip Code: {patient.patientZipCode}</p>
                                            <p>Providers: {patient.providers}</p>
                                            <p>Provider URL: {patient.providerURL}</p>
                                            <p>Treatment Date: {patient.treatmentDate}</p>
                                            <p>Start Time: {patient.startTime}</p>
                                            <p>End Time: {patient.endTime}</p>
                                        </div>
                                        <div>
                                            <input
                                                type="checkbox"
                                                checked={selectedPatients.includes(patient)}
                                                onChange={() => togglePatientSelection(patient)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div >
    );
};

export default PatientList;


