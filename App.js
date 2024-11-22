import { useRef, useState } from 'react'
import { SafeAreaView, StyleSheet, Text, TextInput, View, Button, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import CheckBox from 'expo-checkbox';

export default function App() {
	const [corpTemp, setCorpTemp] = useState('')
	const [ambTemp, setAmbTemp] = useState('')
	const [weight, setWeight] = useState('')

	const [humidity, setHumidity] = useState(false)
	const [water, setWater] = useState(false)
	const [waterFlow, setWaterFlow] = useState(false)
	const [wind, setWind] = useState(false)
	const [clothes, setClothes] = useState('naked')
	const [result, setResult] = useState(null)

	const pickerRef = useRef()

	const openPicker = () => {
		pickerRef.current.focus()
	}

	const closePicker = () => {
		pickerRef.current.blur()
	}

	const clothesTypes = {
		"desnudo": 'naked', 
		"1-2 capas finas": '1-2Layers-thin', 
		"2-3 capas finas": '2-3Layers-thin', 
		"3-4 capas finas": '3-4Layers-thin',
		"Mas capas delgadas o finas": '+4Layers-thin',
		"1-2 capas gruesas": '1-2Layers-thick',
		"2 capas gruesas": '2Layers-thick',
		"+ 2 capas gruesas": '+2Layers-thick',
		"2 o mas gruesas": '2+Layers-thick',
		"Mantas y ropa combinadas": 'combined'
	}

	const correctionFactors = {
		'dry': {
			'air-steady':{
				'naked': 1,
				'1-2Layers-thin': 1.10,
				'2-3Layers-thin': 1.20,
				'3-4Layers-thin': 1.30,
				'+4Layers-thin': 1.40,
				'combined': 2.40
			},
			'air-moving':{
				'naked': 0.75,
				'1-2Layers-thin': 0.90,
				'1-2Layers-thick': 1.20,
				'2-3Layers-thin': 1.20,
				'+4Layers-thin': 1.40,
				'combined': 2.40
			},
		},
		'humid':{
			'air-steady':{
				'2Layers-thick': 1.10,
				'+2Layers-thick': 1.20
			},
			'air-moving':{
				'naked': 0.70,
				'1-2Layers-thin': 0.70,
				'2+Layers-thick': 0.90
			},
			'water-steady': {
				'naked': 0.5
			},
			'water-moving': {
				'naked': 0.35
			}
		}
	}

	const calculateCorrectionFactor = () => {
		let k = 1

		if(humidity) {
			k = water 
				? waterFlow
					? correctionFactors.humid['water-steady'].naked ?? 1
					: correctionFactors.humid['water-moving'].naked ?? 1
				: wind 
					? correctionFactors.humid['air-moving'][clothes] ?? 1
					: correctionFactors.humid['air-steady'][clothes] ?? 1
		} else {
			k = wind 
				? correctionFactors.dry['air-moving'][clothes] ?? 1
				: correctionFactors.dry['air-steady'][clothes] ?? 1
		}

		return k
	}

	const calculateTimeSinceDeath = () => {
		const T_c = parseFloat(corpTemp)
		const T_a = parseFloat(ambTemp)
		const T_s = 37.2
		const intWeight = parseFloat(weight)
		const k = calculateCorrectionFactor()

		const B = (-1.2815 * Math.pow(intWeight, -0.625) + 0.0284) * k

		// console.log(corpTemp)
		// console.log(ambTemp)
		// console.log(weight)
		// console.log(humidity)
		// console.log(water)
		// console.log(waterFlow)
		// console.log(wind)
		// console.log(clothes)
		// console.log(result)
		// console.log(B)
		// console.log(k)
		console.log(B, k, corpTemp, ambTemp, weight, humidity, water, waterFlow, wind, clothes, result)
		
		let timeSinceDeath = 0
		let Q = 1
		let t = 0

		const findTime = (formula) => {
			for (t = 0; t < 200; t += 0.2) {
				t = parseFloat(t.toFixed(1))
				Q = formula(B,t)
				
				const difference = Math.abs((T_c - T_a) / (T_s - T_a) - Q);
				console.log("t:", t, "Q:", Q, "Difference:", difference);

				if (difference < 0.1) {
					return t;
				}
			}
			return t // in case no precise value is found
		}

		if(T_a <= 23) {
			timeSinceDeath = findTime((B,t) => {
				return 1.25 * Math.exp(B*t) - 0.25 * Math.exp(5 * B * t)
			})
		} else {
			timeSinceDeath = findTime((B,t) => {
				return 1.11 * Math.exp(B*t) - 0.11 * Math.exp(10 * B * t)
			})
		}

		console.log(timeSinceDeath)
		setResult(timeSinceDeath.toFixed(2))
	}

	const resetData = () => {
		setResult(null)
		setCorpTemp('')
		setAmbTemp('')
		setWeight('')
		setWind(false)
		setHumidity(false)
		setWater(false)
		setWaterFlow(false)
		setClothes('naked')
	}

	const toggleHumidity = () => {
		setHumidity(!humidity)
	}

	const toggleWater = () => {
		setWater(!water)
	}

	const toggleWaterFlow = () => {
		setWaterFlow(!waterFlow)
	}

	const toggleWind = () => {
		setWind(!wind)
	}

	const dismissKeyboard = () => {
		Keyboard.dismiss();
	};

	return (
		<TouchableWithoutFeedback onPress={dismissKeyboard}>
			<SafeAreaView style={styles.container}>
				<Text style={styles.title}>Nomograma de Henssge</Text>

				<Text style={styles.subTitle}>Temperatura Corporal (ºC)</Text>
				<TextInput 
					style={styles.input}
					inputMode='numeric'
					value={corpTemp}
					onChangeText={setCorpTemp}
				/>

				<Text style={styles.subTitle}>Temperatura Ambiente (ºC)</Text>
				<TextInput 
					style={styles.input}
					inputMode='numeric'
					value={ambTemp}
					onChangeText={setAmbTemp}
				/> 

				<Text style={styles.subTitle}>Peso (kg)</Text>
				<TextInput 
					style={styles.input}
					inputMode='numeric'
					value={weight}
					onChangeText={setWeight}
				/> 

				<View style={styles.checkboxContainer}>
					<TouchableWithoutFeedback onPress={toggleHumidity}>
						<Text style={styles.subTitle}>¿Ambiente humedo?</Text>
					</TouchableWithoutFeedback>
					<CheckBox
						disabled={false}
						value={humidity}
						onValueChange={toggleHumidity}
						style={styles.checkbox}
					/>
				</View>

				{ humidity && (
					<>
						<View style={styles.checkboxContainer}>
							<TouchableWithoutFeedback onPress={toggleWater}>
								<Text style={styles.text}>¿Cuerpo en el agua?</Text>
							</TouchableWithoutFeedback>
							<CheckBox
								disabled={false}
								value={water}
								onValueChange={toggleWater}
								style={styles.checkbox}
							/>
						</View>
						{water && (
							<View style={styles.checkboxContainer}>
								<TouchableWithoutFeedback onPress={toggleWaterFlow}>
									<Text style={styles.text}>¿Agua estancada?</Text>
								</TouchableWithoutFeedback>
								<CheckBox
									disabled={false}
									value={waterFlow}
									onValueChange={toggleWaterFlow}
									style={styles.checkbox}
								/>
							</View>
						)}
					</>
				)}

				{ !water && (
					<>
						<View style={styles.checkboxContainer}>
							<TouchableWithoutFeedback onPress={toggleWind}>
								<Text style={styles.subTitle}>Presencia de Corrientes de Aire</Text>
							</TouchableWithoutFeedback>
							<CheckBox
								disabled={false}
								value={wind}
								onValueChange={toggleWind}
								style={styles.checkbox}
							/>
						</View>
					</>
				)}

				<Text style={styles.subTitle}>Ropa</Text>
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
				<View style={styles.buttonContainer}>
					<View style={[styles.buttonWrapper, styles.redButton]}>
						<Button
							onPress={resetData} 
							style={[styles.button, styles.redButton]}
							title='Clear'
						/>
					</View>

					<View style={styles.buttonWrapper}>
						<Button
							onPress={calculateTimeSinceDeath}
							title='Calcular'
							style={styles.button}
						/>
					</View>
				</View>

				{ result && (
					<Text style={styles.result}>Tiempo desde la muerte: {result} horas</Text>
				)}

			</SafeAreaView>
		</TouchableWithoutFeedback>
	);
}

const styles = StyleSheet.create({
	container: {
	  flex: 1,
	  justifyContent: 'center',
	  alignItems: 'center',
	  padding: 16,
	},
	title: {
	  fontSize: 24,
	  fontWeight: 'bold',
	  marginBottom: 16,
	},
	subTitle: {
	  fontSize: 20,
	  marginBottom: 8,
	  marginTop: 8,
	  marginRight: 8
	},
	input: {
	  width: '100%',
	  padding: 8,
	  borderWidth: 1,
	  borderColor: '#ccc',
	  borderRadius: 4,
	  marginBottom: 16,
	},
	checkboxContainer: {
	  flexDirection: 'row',
	  alignItems: 'center',
	  marginBottom: 16,
	},
	text: {
	  fontSize: 16,
	  marginRight: 8,
	},
	picker: {
	  height: 45,
	  width: '100%',
	  color: '#9EA0A4'
	},
	buttonContainer: {
		marginTop: 20,
		flexDirection: 'row',
		justifyContent: 'space-between',
		width: '70%', // Adjust the width as needed
		paddingHorizontal: 8,
	},
	buttonWrapper: {
		flex: 1,
		height: 40, 
		marginHorizontal: 5,
		borderRadius: 5,
		justifyContent: 'center',
		overflow: 'hidden', 
	},
	redButton: {
		backgroundColor: '#FF0000', // Red button color
	},
	result: {
	  marginTop: 16,
	  fontSize: 18,
	},
	modalOverlay: {
	  flex: 1,
	  backgroundColor: 'rgba(0, 0, 0, 0.5)',
	  justifyContent: 'center',
	  alignItems: 'center',
	},
	modalContent: {
	  backgroundColor: 'white',
	  padding: 20,
	  borderRadius: 10,
	  width: '80%',
	},
});


// const updateSelectClothes = () => {
	// 	return Object.keys(clothesTypes).filter( key => {
	// 		switch(key) {
	// 			case 'desnudo':
	// 				return (humidity && !water && !wind) ? false : true
	// 			case '1-2 capas finas':
	// 				return (humidity && (water || !wind)) ? false : true
	// 			case '2-3 capas finas':
	// 				return !humidity ? true : false
	// 			case '3-4 capas finas':
	// 				return !humidity && !wind ? true : false
	// 			case 'Mas capas delgadas o finas':
	// 				return !humidity ? true : false
	// 			case '1-2 capas gruesas':
	// 				return !humidity && wind ? true : false
	// 			case '2 capas gruesas':
	// 				return humidity && !water && !wind ? true : false
	// 			case '+ 2 capas gruesas':
	// 				return humidity && !water && !wind ? true : false
	// 			case 'Mantas y ropa combinadas':
	// 				return !humidity ? true : false
	// 		}
	// 	})
	// }