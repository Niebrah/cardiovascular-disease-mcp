export const studiesListedInfo = (studies: Object[]) => studies.map((s: any, idx: number) => {
    const NCTId = s.protocolSection.identificationModule.nctId || null;
    const nctIdLink = NCTId ? `https://clinicaltrials.gov/study/${NCTId}` : "n/a";
    const title = s.protocolSection.identificationModule?.briefTitle || "untitled study";
    const conditions = s.protocolSection.conditionsModule?.conditions?.join(", ") || "n/a";
    const overallStatus = s.protocolSection.statusModule.overallStatus || "n/a";
    const locationCountry = s.protocolSection.contactsLocationsModule.locations?.country || "n/a";
    const locationState = s.protocolSection.contactsLocationsModule.locations?.state || "n/a";
    const leadSponsor = s.protocolSection.sponsorCollaboratorsModule.leadSponsor?.name || "n/a";
    const startDate = s.protocolSection.statusModule.startDateStruct.date || "n/a";
    const completionDate = s.protocolSection.statusModule.primaryCompletionDateStruct?.date || "n/a";
    // const eligibilityCriteria = s.protocolSection.eligibilityModule?.eligibilityCriteria || "n/a";
    return (`${idx + 1}. ${title} [${overallStatus}]\n
        - Conditions: ${conditions}\n
        - Location: ${locationState}, ${locationCountry}\ns
        - Lead Sponsor: ${leadSponsor}\n
        - Duration: ${startDate} - ${completionDate}\n
        - More Info: ${nctIdLink}\n
    `);
});
