# Notes

FHIR: a specification for modeling Health data EHR

version: R4

[https://hl7.org/fhir/R4/index.html]

Ex. doct and want to record a patient's vitals

- find patient ID
- record quality, blood pressure -> srote observation resource

Store patient data uniformly

- FHIR is being quickly adopted so everybody can agree on a specific format exchange

other standard: HL7

[https://app.meldrx.com/Account/Login?returnUrl=%2F]

- create new account for free
- get a free FHIR server

## Get API key

- use DH workspace -> use someone's login
- Docker API

## MCP (Model Context Protocol)

1. ask a question from AI
2. give AI a tool to calculate patient age -> MCP

> can use any model for project: chatGPT, Gemini (don't have to train manually)

[https://modelcontextprotocol.io/introduction]

[https://learn.microsoft.com/en-us/azure/ai-foundry/foundry-models/how-to/create-model-deployments?pivots=ai-foundry-portal]

[https://github.com/darena-solutions/darena-health-community-mcp]

- in LLM, way to connect to FHIR server is via MCP tool
  - read FHIR server, retrieve patient details
  - got birthday -> calculate bday
- can find MCP tool in open source DH repo (GitHub)
  - ex. can find function to find retrieve data functions
  - the tool just knows the tool exists
  - up to the tool to query the FHIR server

## Database

DH uses PostGres (alt. MongoDB, SQL)

- open source, not tied to any company
- can store FHIR using any database
  - only difference is how you would query for data

hosting w/ Azure

FHIR data: stored as JSON in tables in postgres

DH is a Microsoft shop

- lot of C#
- services hosted w/ Azure

## Project

to learn FHIR: create a very simple EHR system

- create a patient -> enter demographics
  - name, gender, race
- make a dashboard to be able to search for patients
- patient vitals (more advanced)

### chatbot demo (copilot)

- launch a form to run a risk assessment for a patient
  - doctor/nurse fills in health data -> save
- MCP takes a tool and makes it ready for LLM processing

Examples for tools:
[https://www.mdcalc.com/#Popular]
