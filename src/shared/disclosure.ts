import { v4 as uuidv4 } from 'uuid';

enum disclosureStatus {
  disclosed,
  remediated,
  invalid, // the finding was proven to not be exploitable or otherwise a false positive
  regression,
}
/**
 * A disclosure is a notification or ticket created to deal with a particular finding
 */
class disclosure {
  id: string;
  host: string;
  template: string;
  timestamp: string;
  status: disclosureStatus;
  ticketURL: string;

  constructor(
    host: string,
    template: string,
    status: disclosureStatus,
    ticketURL: string
  ) {
    this.id = uuidv4();
    this.host = host;
    this.timestamp = new Date().toISOString();
    this.template = template;
    this.status = status;
    this.ticketURL = ticketURL;
  }
}
