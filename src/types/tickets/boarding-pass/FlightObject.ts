import { AppLinkData } from "./AppLinkData.js"
import { Barcode } from "./Barcode.js"
import { BoardingAndSeatingInfo } from "./BoardingAndSeatingInfo.js"
import { FlightClass } from "./FlightClass.js"
import { GroupingInfo } from "./GroupingInfo.js"
import { Image } from "./Image.js"
import { ImageModuleData } from "./ImageModuleData.js"
import { InfoModuleData } from "./InfoModuleData.js"
import { LatLongPoint } from "./LatLongPoint.js"
import { LinksModuleData } from "./LinksModuleData.js"
import { Message } from "./Message.js"
import { PassConstraints } from "./PassConstraints.js"
import { ReservationInfo } from "./ReservationInfo.js"
import { RotatingBarcode } from "./RotatingBarcode.js"
import { StateEnum } from "./State.js"
import { TextModuleData } from "./TextModuleData.js"
import { TimeInterval } from "./TimeInterval.js"
export type FlightObject = {
	/**
	 * Identifies what kind of resource this is. Value: the fixed string "walletobjects#flightObject".
	 * @deprecated
	 */
	kind?: string;
	/**
	 * A copy of the inherited fields of the parent class. These fields are retrieved during a GET.
	 */
	classReference?: FlightClass;
	/**
	 * eg: "Dave M Gahan" or "Gahan/Dave" or "GAHAN/DAVEM"
	 */
	passengerName: string;
	/**
	 * Passenger specific information about boarding and seating.
	 */
	boardingAndSeatingInfo?: BoardingAndSeatingInfo;
	/**
	 * Required. Information about flight reservation.
	 */
	reservationInfo: ReservationInfo;
	/**
	 * An image for the security program that applies to the passenger.
	 */
	securityProgramLogo?: Image;
	/**
	 * The background color for the card. If not set the dominant color of the hero image is used, and if no hero image is set, the dominant color of the logo is used. The format is #rrggbb where rrggbb is a hex RGB triplet, such as #ffcc00. You can also use the shorthand version of the RGB triplet which is #rgb, such as #fc0.
	 */
	hexBackgroundColor?: string;
	/**
	 * Required. The unique identifier for an object. This ID must be unique across all objects from an issuer. This value should follow the format issuer ID.identifier where the former is issued by Google and latter is chosen by you. The unique identifier should only include alphanumeric characters, '.', '_', or '-'.
	 */
	id: string;
	/**
	 * Class IDs should follow the format issuer ID.identifier where the former is issued by Google and latter is chosen by you.
	 */
	classId: string;
	/**
	 * Deprecated
	 * @deprecated
	 */
	version?: number;
	/**
	 * Required. The state of the object. This field is used to determine how an object is displayed in the app. For example, an inactive object is moved to the "Expired passes" section.
	 */
	state: StateEnum;
	/**
	 * The barcode type and value.
	 */
	barcode?: Barcode;
	/**
	 * An array of messages displayed in the app. All users of this object will receive its associated messages. The maximum number of these fields is 10.
	 */
	messages?: Message[];
	/**
	 * The time period this object will be active and object can be used. An object's state will be changed to expired when this time period has passed.
	 */
	validTimeInterval?: TimeInterval;
	/**
	 * Note: This field is currently not supported to trigger geo notifications.
	 */
	locations?: LatLongPoint[];
	/**
	 * Indicates if the object has users. This field is set by the platform.
	 */
	hasUsers?: boolean;
	/**
	 * The value that will be transmitted to a Smart Tap certified terminal over NFC for this object. The class level fields enableSmartTap and redemptionIssuers must also be set up correctly in order for the pass to support Smart Tap. Only ASCII characters are supported.
	 */
	smartTapRedemptionValue?: string;
	/**
	 * Whether this object is currently linked to a single device. This field is set by the platform when a user saves the object, linking it to their device. Intended for use by select partners. Contact support for additional information.
	 */
	hasLinkedDevice?: boolean;
	/**
	 * Currently, this can only be set for Flights.
	 */
	disableExpirationNotification?: boolean;
	/**
	 * Deprecated. Use textModulesData instead.
	 * @deprecated
	 */
	infoModuleData?: InfoModuleData;
	/**
	 * Image module data. The maximum number of these fields displayed is 1 from object level and 1 for class object level.
	 */
	imageModulesData?: ImageModuleData[];
	/**
	 * Text module data. If text module data is also defined on the class, both will be displayed. The maximum number of these fields displayed is 10 from the object and 10 from the class.
	 */
	textModulesData?: TextModuleData[];
	/**
	 * Links module data. If links module data is also defined on the class, both will be displayed.
	 */
	linksModuleData?: LinksModuleData;
	/**
	 * Optional information about the partner app link.
	 */
	appLinkData?: AppLinkData;
	/**
	 * The rotating barcode type and value.
	 */
	rotatingBarcode?: RotatingBarcode;
	/**
	 * Optional banner image displayed on the front of the card. If none is present, hero image of the class, if present, will be displayed. If hero image of the class is also not present, nothing will be displayed.
	 */
	heroImage?: Image;
	/**
	 * Information that controls how passes are grouped together.
	 */
	groupingInfo?: GroupingInfo;
	/**
	 * Pass constraints for the object. Includes limiting NFC and screenshot behaviors.
	 */
	passConstraints?: PassConstraints;
}
