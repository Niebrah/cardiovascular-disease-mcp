import { formatList } from "./format-list";

export const studiesListedInfo = (studies: Object[]) =>
  studies.map((s: any, idx: number) => {
    const NCTId = s.protocolSection.identificationModule.nctId || null;
    const nctIdLink = NCTId
      ? `https://clinicaltrials.gov/study/${NCTId}`
      : "n/a";
    const title =
      s.protocolSection.identificationModule?.briefTitle || "untitled";
    const allConditions = s.protocolSection.conditionsModule?.conditions || [];
    const conditions = formatList(allConditions);
    const overallStatus = s.protocolSection.statusModule.overallStatus || "n/a";
    const locationArr =
      s.protocolSection.contactsLocationsModule.locations || [];
    const uniqueLocations: string[] = Array.from(
      new Set(
        locationArr.map(
          (loc: any) => `${loc.state || "n/a"}, ${loc.country || "n/a"}`
        )
      )
    );
    const formattedLocations = formatList(uniqueLocations);
    const leadSponsor =
      s.protocolSection.sponsorCollaboratorsModule.leadSponsor?.name || "n/a";
    const startDate =
      s.protocolSection.statusModule.startDateStruct.date || "n/a";
    const completionDate =
      s.protocolSection.statusModule.primaryCompletionDateStruct?.date || "n/a";

    return `${idx + 1}. ${title} [${overallStatus}]\n
        - Conditions: ${conditions}\n
        - Location: ${formattedLocations}\n
        - Lead Sponsor: ${leadSponsor}\n
        - Duration: ${startDate} to ${completionDate}\n
        - More Info: ${nctIdLink}\n
    `;
  });
