import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from 'flowbite-react';

interface Patient {
    userID: string;
    patientID: string;
    patientName: string;
    patientDOB: string;
    providers: string;
    providerURL: string;
    treatmentDate: string;
    startTime: string;
    endTime: string;
    features: string;
}

interface PatientsData {
    OonTop: Patient[];
    eCW: Patient[];
    AMD: Patient[];
    Quest: Patient[];
    Behavidance: Patient[];
}

const PatientList: React.FC = () => {
    const [patients, setPatients] = useState<PatientsData | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [searchResults, setSearchResults] = useState<Patient[]>([]);
    const [selectedPatients, setSelectedPatients] = useState<Patient[]>([]);
    const [mergedPatient, setMergedPatient] = useState<Patient | null>(null);

    useEffect(() => {
        axios.get('/patients.json')
            .then(response => setPatients(response.data))
            .catch(error => console.error('Error fetching patients:', error));
    }, []);

    const searchPatients = (patientName: string) => {
        if (!patients) return;

        const allPatients = [
            ...patients.OonTop,
            ...patients.eCW,
            ...patients.AMD,
            ...patients.Quest,
            ...patients.Behavidance
        ];


        const matchingPatients = allPatients.filter(patient =>
            patient.patientName.toLowerCase().includes(patientName.toLowerCase())
        );

        setSearchResults(matchingPatients);
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
                providers: selectedPatients.map(p => p.providers).join(', '),
                providerURL: selectedPatients.map(p => p.providerURL).join(', '),
                treatmentDate: new Date().toISOString().split('T')[0],
                startTime: new Date().toISOString(),
                endTime: new Date().toISOString(),
                features: selectedPatients.map(p => p.features).join(', ')
            };
            setMergedPatient(mergedPatient);
        } else {
            setMergedPatient(null);
        }
    }


    const generateUniqueID = () => {
        return 'xxxxxx'.replace(/[x]/g, () => (Math.random() * 16 | 0).toString(16));
    }

    return (
        <div className=" mt-6 max-w-screen-2xl mx-auto flex flex-row gap-4">
            <div className="flex-2">
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search patient"
                        className="py-2 px-6  border rounded-md "
                    />
                    <Button onClick={() => searchPatients(searchTerm)} gradientDuoTone="purpleToBlue" className=" border">
                        Search
                    </Button>
                    <Button onClick={mergePatients} gradientDuoTone="purpleToBlue" className="border">
                        Merge
                    </Button>
                </div>


                {searchResults.length > 0 && (
                    <div className="mt-8">
                        <h2 className='text-2xl font-semibold mb-2'>Search Results</h2>
                        <ul className="list-none p-0">
                            {searchResults.map((patient, index) => (
                                <li key={`${patient.patientID}-${index}`} className="my-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedPatients.includes(patient)}
                                        onChange={() => togglePatientSelection(patient)}
                                        className="mr-2"
                                    />
                                    {patient.patientName} - {patient.providers}
                                </li>
                            ))}
                        </ul>

                    </div>
                )}



                {mergedPatient && (
                    <div className="w-52 my-8 ">
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

                        </div>
                    </div>
                )}
            </div>

            <div className="flex-1 ">
                <div className="flex flex-wrap border rounded-md">
                    {patients && Object.entries(patients).map(([group, patientsList]) => (
                        <div key={group} className="w-full  xl:w-1/5 px-2">
                            <h3 className='text-2xl font-semibold mb-2'> {group}</h3>
                            {patientsList.map((patient: Patient) => (
                                searchResults.includes(patient) && (
                                    <div key={patient.patientID} className="border p-4 mb-4 rounded-md">
                                        <h4>{patient.patientName}</h4>
                                        <p><strong>Patient ID:</strong> {patient.patientID}</p>
                                        <p><strong>Date of Birth:</strong> {patient.patientDOB}</p>
                                        <p><strong>Providers:</strong> {patient.providers}</p>
                                        <p><strong>Provider URLs:</strong> {patient.providerURL}</p>
                                        <p><strong>Treatment Date:</strong> {patient.treatmentDate}</p>
                                        <p><strong>Start Time:</strong> {patient.startTime}</p>
                                        <p><strong>End Time:</strong> {patient.endTime}</p>
                                        <p><strong>Features:</strong> {patient.features}</p>
                                    </div>
                                )
                            ))}
                        </div>
                    ))}
                </div>
            </div >

        </div >
    );

}

export default PatientList;






