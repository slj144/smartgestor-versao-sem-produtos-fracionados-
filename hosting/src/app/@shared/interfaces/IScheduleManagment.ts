import { TTimezone } from "../../../assets/tools/iTools/types/TTimezones";
import { IAgenda } from "./IAgenda";
import { IEvent } from "./IEvent";

export interface IScheduleManagment{
	data?: IAgenda | IEvent,
	notifiedsCollection?: string;
	collection?: string;
	timezone?: TTimezone;
}