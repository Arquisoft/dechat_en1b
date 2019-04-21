import {Injectable} from '@angular/core';
import {SolidSession} from '../models/solid-session.model';
// TODO: Remove any UI interaction from this service
import {ChatMessage} from '../models/chat-message.model';
import {NgForm} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import {NamedNode} from 'src/assets/types/rdflib';

declare let solid: any;
declare let $rdf: any;

// import * as $rdf from 'rdflib'

const VCARD = $rdf.Namespace('http://www.w3.org/2006/vcard/ns#');
const FOAF = $rdf.Namespace('http://xmlns.com/foaf/0.1/');
const LDP = $rdf.Namespace('http://www.w3.org/ns/ldp#');
const SCHEMA = $rdf.Namespace('http://schema.org/');

/**
 * A service layer for RDF data manipulation using rdflib.js
 * @see https://solid.inrupt.com/docs/manipulating-ld-with-rdflib
 */
@Injectable({
  providedIn: 'root',
})
export class RdfService {

  session: SolidSession;
  store = $rdf.graph();

  /**
   * A helper object that connects to the web, loads data, and saves it back. More powerful than using a simple
   * store object.
   * When you have a fetcher, then you also can ask the query engine to go fetch new linked data automatically
   * as your query makes its way across the web.
   * @see http://linkeddata.github.io/rdflib.js/doc/Fetcher.html
   */
  fetcher = $rdf.Fetcher;

  /**
   * The UpdateManager allows you to send small changes to the server to “patch” the data as your user changes data in
   * real time. It also allows you to subscribe to changes other people make to the same file, keeping track of
   * upstream and downstream changes, and signaling any conflict between them.
   * @see http://linkeddata.github.io/rdflib.js/doc/UpdateManager.html
   */
  updateManager = $rdf.UpdateManager;

  constructor (private toastr: ToastrService) {
    const fetcherOptions = {};
    this.fetcher = new $rdf.Fetcher(this.store, fetcherOptions);
    this.updateManager = new $rdf.UpdateManager(this.store);
    this.getSession();
  }

  /**
   * Fetches the session from Solid, and store results in localStorage
   */
  getSession = async() => {
    this.session = await solid.auth.currentSession(localStorage);
  }

  /**
   * Gets a node that matches the specified pattern using the VCARD onthology
   *
   * any() can take a subject and a predicate to find Any one person identified by the webId
   * that matches against the node/predicated
   *
   * @param {string} node VCARD predicate to apply to the $rdf.any()
   * @param {string?} webId The webId URL (e.g. https://yourpod.solid.community/profile/card#me)
   * @return {string} The value of the fetched node or an emtpty string
   * @see https://github.com/solid/solid-tutorial-rdflib.js
   */
  getValueFromVcard = (node: string, webId?: string): string | any => {
    return this.getValueFromNamespace(node, VCARD, webId);
  }

  /**
   * Gets a node that matches the specified pattern using the FOAF onthology
   * @param {string} node FOAF predicate to apply to the $rdf.any()
   * @param {string?} webId The webId URL (e.g. https://yourpod.solid.community/profile/card#me)
   * @return {string} The value of the fetched node or an emtpty string
   */
  getValueFromFoaf = (node: string, webId?: string) => {
    return this.getValueFromNamespace(node, FOAF, webId);
  }

  /**
   * Gets a node that matches the specified pattern using the FOAF onthology
   * @param {string} node FOAF predicate to apply to the $rdf.any()
   * @param {string?} webId The webId URL (e.g. https://yourpod.solid.community/profile/card#me)
   * @return {string} The value of the fetched node or an emtpty string
   */
  getValueFromSchema = (node: string, webId?: string) => {
    return this.getValueFromNamespace(node, SCHEMA, webId);
  }

  /**
   * Method that transforms the data from a form to update the profile.
   * @param form With the new values.
   * @param me Current user in session.
   * @param doc
   */
  transformDataForm = (form: NgForm, me: any, doc: any) => {
    const insertions = [];
    const deletions = [];
    const fields = Object.keys(form.value);
    const oldProfileData = JSON.parse(localStorage.getItem('oldProfileData')) || {};

    // We need to split out into three code paths here:
    // 1. There is an old value and a new value. This is the update path
    // 2. There is no old value and a new value. This is the insert path
    // 3. There is an old value and no new value. Ths is the delete path
    // These are separate codepaths because the system needs to know what to do in each case
    fields.map(field => {

      const predicate = VCARD(this.getFieldName(field));
      const subject = this.getUriForField(field, me);
      const why = doc;

      const fieldValue = this.getFieldValue(form, field);
      const oldFieldValue = this.getOldFieldValue(field, oldProfileData);

      // if there's no existing home phone number or email address, we need to add one, then add the link for hasTelephone or hasEmail
      if (!oldFieldValue && fieldValue && (field === 'phone' || field === 'email')) {
        this.addNewLinkedField(field, insertions, predicate, fieldValue, why, me);
      } else {

        // Add a value to be updated
        if (oldProfileData[field] && form.value[field] && !form.controls[field].pristine) {
          deletions.push($rdf.st(subject, predicate, oldFieldValue, why));
          insertions.push($rdf.st(subject, predicate, fieldValue, why));

          // Add a value to be deleted
        } else if (oldProfileData[field] && !form.value[field] && !form.controls[field].pristine) {
          deletions.push($rdf.st(subject, predicate, oldFieldValue, why));

          // Add a value to be inserted
        } else if (!oldProfileData[field] && form.value[field] && !form.controls[field].pristine) {
          insertions.push($rdf.st(subject, predicate, fieldValue, why));
        }
      }
    });
    return {
      insertions: insertions,
      deletions: deletions
    };
  }

  // TODO: improve this JSDoc
  /**
   * Method that adds a new linked field.
   * @param insertions
   * @param predicate
   * @param fieldValue
   * @param why
   * @param me
   */
  private addNewLinkedField(field: string, insertions: any[], predicate: any, fieldValue: any, why: any, me: any) {
    // Generate a new ID. This id can be anything but needs to be unique.
    const newId = field + ':' + Date.now();

    // Get a new subject, using the new ID
    const newSubject = $rdf.sym(this.session.webId.split('#')[0] + '#' + newId);

    // Set new predicate, based on email or phone fields
    const newPredicate = field === 'phone' ? $rdf.sym(VCARD('hasTelephone')) : $rdf.sym(VCARD('hasEmail'));

    // Add new phone or email to the pod
    insertions.push($rdf.st(newSubject, predicate, fieldValue, why));

    // Set the type (defaults to Home/Personal for now) and insert it into the pod as well
    // Todo: Make this dynamic
    const type = field === 'phone' ? $rdf.literal('Home') : $rdf.literal('Personal');
    insertions.push($rdf.st(newSubject, VCARD('type'), type, why));

    // Add a link in #me to the email/phone number (by id)
    insertions.push($rdf.st(me, newPredicate, newSubject, why));
  }

  /**
   * Returns an URI for a given resource.
   * @param field To be transformed.
   * @param me Default URI.
   */
  private getUriForField(field, me): string {
    let uriString: string;
    let uri: any;

    switch (field) {
      case 'phone':
        uriString = this.getValueFromVcard('hasTelephone');
        if (uriString) {
          uri = $rdf.sym(uriString);
        }
        break;
      case 'email':
        uriString = this.getValueFromVcard('hasEmail');
        if (uriString) {
          uri = $rdf.sym(uriString);
        }
        break;
      default:
        uri = me;
        break;
    }

    return uri;
  }

  /**
   * Extracts the value of a field of a NgForm and converts it to a $rdf.NamedNode
   * @param {NgForm} form
   * @param {string} field The name of the field that is going to be extracted from the form
   * @return {RdfNamedNode}
   */
  private getFieldValue(form: NgForm, field: string): any {
    let fieldValue: any;

    if (!form.value[field]) {
      return;
    }

    switch (field) {
      case 'phone':
        fieldValue = $rdf.sym('tel:+' + form.value[field]);
        break;
      case 'email':
        fieldValue = $rdf.sym('mailto:' + form.value[field]);
        break;
      default:
        fieldValue = form.value[field];
        break;
    }

    return fieldValue;
  }

  /**
   * Returns the value of a field of the old profile (before update).
   * @param field To be accessed.
   * @param oldProfile To be accessed.
   */
  private getOldFieldValue(field: string, oldProfile: { [x: string]: any; }): any {
    let oldValue: any;

    if (!oldProfile || !oldProfile[field]) {
      return;
    }

    switch (field) {
      case 'phone':
        oldValue = $rdf.sym('tel:+' + oldProfile[field]);
        break;
      case 'email':
        oldValue = $rdf.sym('mailto:' + oldProfile[field]);
        break;
      default:
        oldValue = oldProfile[field];
        break;
    }
    return oldValue;
  }

  /**
   * Auxiliary method to return the name of field.
   * @param field To get the name from.
   */
  private getFieldName(field: string): string {
    switch (field) {
      case 'company':
        return 'organization-name';
      case 'phone':
      case 'email':
        return 'value';
      default:
        return field;
    }
  }

  /**
   *  Method that uses the update manager to, given the data of a form, update the info in your profile.
   * @param form Form with the new profile data.
   */
  updateProfile = async (form: NgForm) => {
    const me = $rdf.sym(this.session.webId);
    const doc = $rdf.NamedNode.fromValue(this.session.webId.split('#')[0]);
    const data = this.transformDataForm(form, me, doc);

    // Update existing values
    if (data.insertions.length > 0 || data.deletions.length > 0) {
      this.updateManager.update(data.deletions, data.insertions, (response: any, success: any, message: string) => {
        if (success) {
          this.toastr.success('Your Solid profile has been successfully updated', 'Success!');
          form.form.markAsPristine();
          form.form.markAsTouched();
        } else {
          this.toastr.error('Message: ' + message, 'An error has occurred');
        }
      });
    }
  }

  /**
   * Function to get address.
   */
  getAddress = () => {
    const linkedUri = this.getValueFromVcard('hasAddress');

    if (linkedUri) {
      return {
        locality: this.getValueFromVcard('locality', linkedUri),
        country_name: this.getValueFromVcard('country-name', linkedUri),
        region: this.getValueFromVcard('region', linkedUri),
        street: this.getValueFromVcard('street-address', linkedUri),
      };
    }
    return {};
  }

  /**
   * Function to get email. This returns only the first email, which is temporary
   */
  getEmail = () => {
    const linkedUri = this.getValueFromVcard('hasEmail');

    if (linkedUri) {
      return this.getValueFromVcard('value', linkedUri).split('mailto:')[1];
    }
    return '';
  }

  /**
   * Function to get phone number. This returns only the first phone number, which is temporary. It also ignores the type.
   */
  getPhone = () => {
    const linkedUri = this.getValueFromVcard('hasTelephone');

    if (linkedUri) {
      return this.getValueFromVcard('value', linkedUri).split('tel:+')[1];
    }
  }

  /**
   * Returns the whole profile of the current user in session.
   */
  getProfile = async () => {
    if (!this.session) {
      await this.getSession();
    }

    try {
      await this.fetcher.load(this.session.webId);

      return {
        fn : this.getValueFromVcard('fn'),
        company : this.getValueFromVcard('organization-name'),
        phone: this.getPhone(),
        role: this.getValueFromVcard('role'),
        image: this.getValueFromVcard('hasPhoto'),
        address: this.getAddress(),
        email: this.getEmail(),
      };
    } catch (error) {
      console.log(`Error fetching data: ${error}`);
    }
  }

  /**
   * Gets any resource that matches the node, using the provided Namespace
   * @param {string} node The name of the predicate to be applied using the provided Namespace
   * @param {$rdf.namespace} namespace The RDF Namespace
   * @param {string?} webId The webId URL (e.g. https://yourpod.solid.community/profile/card#me)
   */
  private getValueFromNamespace(node: string, namespace: any, webId?: string): string | any {
    const store = this.store.any($rdf.sym(webId || this.session.webId), namespace(node));
    if (store) {
      return store.value;
    }
    return '';
  }

  //////////////////////
  // EXTRA FUNCTIONS //
  ////////////////////

  /**
   * Method to extract a value from the profile and return it as string.
   * @param field To be accessed.
   */
  async getFieldAsStringFromProfile(field: string): Promise<string> {
      return this.getFieldAsString(this.session.webId, field, VCARD);
  }

  /**
   * Generic method to extract a value as a string given a field to be accessed and the namespace where we
   * are working.
   * @param webId Where the resource is located.
   * @param field To be accessed.
   * @param namespace To work with.
   */
  private async getFieldAsString(webId: string, field: string, namespace: any): Promise<string> {
    try {
      await this.fetcher.load(this.store.sym(webId).doc());
      return this.store.any(this.store.sym(webId), namespace(field));
    } catch (error) {
      console.log(`Error fetching data: ${error}`);
    }
  }

  /**
   * Generic method to extract a value as and array given a field to be accessed and the namespace where we
   * are working.
   * @param webId Where the resource is located.
   * @param field To be accessed.
   * @param namespace To work with.
   */
  private async getDataAsArray(webId: string | String, field: string, namespace: any): Promise<Array<NamedNode>> {
    try {
        await this.fetcher.load(this.store.sym(webId).doc(), {force: true, clearPreviousData: true});
        return this.store.each(this.store.sym(webId), namespace(field)); // .forEach(friend => console.log(friend.value));
        // Just to test that it works
    } catch (error) {
      console.log(`Error fetching data: ${error}`);
    }
  }

  /**
   * Returns and array containing the nodes representing the friends of the current user.
   */
  async getFriends(): Promise<Array<NamedNode>> {
    const webId = this.session.webId;
    return this.getDataAsArray(webId, 'knows', FOAF);
  }

  /**
   * Returns a value from a given field provided a webId.
   * @param webId In this case we are going to use the webId of our contacts.
   * @param field To be accessed.
   */
  async getFriendData(webId: any, field: string): Promise<String> {
    return this.getFieldAsString(webId, field, VCARD);
  }

  /**
   * Returns an array of nodes from the container specified.
   * @param container To be accessed.
   */
  async getElementsFromContainer(container: String): Promise<Array<NamedNode>> {
    return this.getDataAsArray(container, 'contains', LDP);
  }

  /**
   * Method to add a friend to the current user's friend list given its webId.
   * @param webId Of the friend to be added.
   */
  addFriend(webId: string) {
    const me = $rdf.sym(this.session.webId);
    const friend = $rdf.sym(webId);
    const toBeInserted = $rdf.st(me, FOAF('knows'), friend, me.doc());
    this.updateManager.update([], toBeInserted, (response, success, message) => {
      if (success) {
          this.toastr.success('Friend added', 'Success!');
        } else {
          this.toastr.error('Message: ' + message, 'An error has occurred');
        }
    });
  }

  /**
   * Method to remove a friend from the current user's friend list given its webId.
   * @param webId Of the friend to be removed.
   */
  removeFriend(webId: string) {
    const me = $rdf.sym(this.session.webId);
    const friend = $rdf.sym(webId);
    const toBeInserted = $rdf.st(me, FOAF('knows'), friend, me.doc());
    this.updateManager.update(toBeInserted, [], (response: any, success: any, message: string) => {
      if (success) {
          this.toastr.success('Friend removed', 'Success!');
        } else {
          this.toastr.error('Message: ' + message, 'An error has occurred');
        }
    });
  }

  // TODO: when creating a message, use an autogenerated UID based on the timestamp for the name
  /**
   * Posts a message to a container.
   * @param message To be posted.
   * @param webId Where the message is going to be placed.
   */
  postMessage = async (message: ChatMessage, webId: any) => {
    const acl = $rdf.graph();
    acl.add();
    $rdf.serialize(null, acl, webId, (err: any, body: any) => {
      // use something like updateManager to PUT the body
    });
  }
}
