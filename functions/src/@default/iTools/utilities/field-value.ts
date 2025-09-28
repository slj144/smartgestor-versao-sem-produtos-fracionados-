import { TTimezone } from "../types/TTimezones";

export class FieldValue{
	public control(collName: string, docName: string, propertyName: string = null, step: number = 1,){

			if(!step || step <= 0){
	
				console.error("step must be great than 0.");
				return undefined;
			}
	
			return propertyName && propertyName.trim() ? `$control(${collName},${docName},${step},${propertyName.trim()})` : `$control(${collName},${docName},${step})`;
		}
	
		public bindBatchData(index: number, propertyName: string){
	
			return `$bindBatchData(${index},${propertyName})`;
		}
	
		public date(timezone?: TTimezone, format?: "DH" | "D" | "H"){
	
			let str = "$date(";
	
			if(timezone){ str += timezone.trim(); }
	
			str += ", ";
	
			if(format && format.trim()){ 
				
				str += format.trim(); 
			}else{
	
				str+= timezone ? "DH" : "";
			}
	
			str += ")";
	
			return timezone ? str.trim() : `$date()`;
		}
	
		public inc(value: number = 1){
			
			return `$inc(${value ? value : 1})`;
		}
	
		public unset(){
	
			return "$unset()";
		}
}

