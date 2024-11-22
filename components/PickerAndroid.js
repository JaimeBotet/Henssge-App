import { useRef, useState } from 'react'
import RNPickerSelect from 'react-native-picker-select';

const clothesTypes = {
	"desnudo": 0, 
	"1-2 capas finas": 1, 
	"2-3 capas finas": 2, 
	"3-4 capas finas": 3,
	"1-2 capas gruesas": 4,
	"Mas capas delgadas o finas": 5,
	"Mantas y ropa combinadas": 6,
	"2 capas gruesas": 7,
	"+ 2 capas gruesas": 8
}

const [clothes, setClothes] = useState(0)
const pickerRef = useRef()

const pickerSelectStyles = StyleSheet.create({
	inputIOS: {
		fontSize: 16,
		paddingVertical: 12,
		paddingHorizontal: 10,
		color: '#9EA0A4',
		width:'70%',
		alignSelf: 'center',
		textAlign: 'center'
	},
	inputAndroid: {
		fontSize: 16,
		paddingHorizontal: 10,
		paddingVertical: 8,
		borderWidth: 0.5,
		borderColor: 'purple',
		borderRadius: 8,
		color: 'black',
		paddingRight: 30, // to ensure the text is never behind the icon
	},
});

export default function PickerAndroid () {
	return (
		<Picker
			ref={pickerRef}
			selectedValue={clothes}
			style={styles.picker}
			onValueChange={(itemValue) => setClothes(itemValue) }
		>
			{
				Object.keys(clothesTypes).map( (key) => (
					<Picker.Item label={key} value={clothesTypes[key]} key={key}/>
				))
			}
		</Picker>
	)
}

const styles = StyleSheet.create({
	picker: {
	  height: 45,
	  width: '100%',
	  color: '#9EA0A4'
	}
})