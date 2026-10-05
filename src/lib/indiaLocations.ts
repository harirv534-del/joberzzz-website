// India-only location data: State -> District / City -> Area (optional).
// Used by the Job Seeker profile, Recruiter job posting and job search filter.

const D = (s: string) => s.split('|').map(x => x.trim()).filter(Boolean);

export const INDIA_DISTRICTS: Record<string, string[]> = {
  'Andaman and Nicobar Islands': D('Nicobars|North and Middle Andaman|Port Blair|South Andaman'),
  'Andhra Pradesh': D('Alluri Sitharama Raju|Anakapalli|Anantapur|Annamayya|Bapatla|Chittoor|Dr. B.R. Ambedkar Konaseema|East Godavari|Eluru|Guntur|Kadapa|Kakinada|Krishna|Kurnool|Nandyal|NTR|Palnadu|Parvathipuram Manyam|Prakasam|Sri Sathya Sai|Srikakulam|Tirupati|Vijayawada|Visakhapatnam|Vizianagaram|West Godavari|Nellore'),
  'Arunachal Pradesh': D('Anjaw|Changlang|Dibang Valley|East Kameng|East Siang|Itanagar|Kamle|Kra Daadi|Kurung Kumey|Lepa Rada|Lohit|Longding|Lower Dibang Valley|Lower Siang|Lower Subansiri|Namsai|Pakke-Kessang|Papum Pare|Shi Yomi|Siang|Tawang|Tirap|Upper Siang|Upper Subansiri|West Kameng|West Siang'),
  'Assam': D('Bajali|Baksa|Barpeta|Biswanath|Bongaigaon|Cachar|Charaideo|Chirang|Darrang|Dhemaji|Dhubri|Dibrugarh|Dima Hasao|Goalpara|Golaghat|Guwahati|Hailakandi|Hojai|Jorhat|Kamrup|Kamrup Metropolitan|Karbi Anglong|Karimganj|Kokrajhar|Lakhimpur|Majuli|Morigaon|Nagaon|Nalbari|Sivasagar|Sonitpur|South Salmara-Mankachar|Tinsukia|Udalguri|West Karbi Anglong|Silchar'),
  'Bihar': D('Araria|Arwal|Aurangabad|Banka|Begusarai|Bhagalpur|Bhojpur|Buxar|Darbhanga|East Champaran|Gaya|Gopalganj|Jamui|Jehanabad|Kaimur|Katihar|Khagaria|Kishanganj|Lakhisarai|Madhepura|Madhubani|Munger|Muzaffarpur|Nalanda|Nawada|Patna|Purnia|Rohtas|Saharsa|Samastipur|Saran|Sheikhpura|Sheohar|Sitamarhi|Siwan|Supaul|Vaishali|West Champaran'),
  'Chandigarh': D('Chandigarh'),
  'Chhattisgarh': D('Balod|Baloda Bazar|Balrampur|Bastar|Bemetara|Bijapur|Bilaspur|Dantewada|Dhamtari|Durg|Gariaband|Gaurela-Pendra-Marwahi|Janjgir-Champa|Jashpur|Kabirdham|Kanker|Kondagaon|Korba|Koriya|Mahasamund|Manendragarh|Mohla-Manpur|Mungeli|Narayanpur|Raigarh|Raipur|Rajnandgaon|Sakti|Sarangarh-Bilaigarh|Sukma|Surajpur|Surguja|Bhilai'),
  'Dadra and Nagar Haveli and Daman and Diu': D('Dadra and Nagar Haveli|Daman|Diu|Silvassa'),
  'Delhi': D('Central Delhi|East Delhi|New Delhi|North Delhi|North East Delhi|North West Delhi|Shahdara|South Delhi|South East Delhi|South West Delhi|West Delhi'),
  'Goa': D('North Goa|Panaji|South Goa|Margao'),
  'Gujarat': D('Ahmedabad|Amreli|Anand|Aravalli|Banaskantha|Bharuch|Bhavnagar|Botad|Chhota Udaipur|Dahod|Dang|Devbhoomi Dwarka|Gandhinagar|Gir Somnath|Jamnagar|Junagadh|Kheda|Kutch|Mahisagar|Mehsana|Morbi|Narmada|Navsari|Panchmahal|Patan|Porbandar|Rajkot|Sabarkantha|Surat|Surendranagar|Tapi|Vadodara|Valsad|Vapi'),
  'Haryana': D('Ambala|Bhiwani|Charkhi Dadri|Faridabad|Fatehabad|Gurugram|Hisar|Jhajjar|Jind|Kaithal|Karnal|Kurukshetra|Mahendragarh|Nuh|Palwal|Panchkula|Panipat|Rewari|Rohtak|Sirsa|Sonipat|Yamunanagar'),
  'Himachal Pradesh': D('Bilaspur|Chamba|Hamirpur|Kangra|Kinnaur|Kullu|Lahaul and Spiti|Mandi|Shimla|Sirmaur|Solan|Una'),
  'Jammu and Kashmir': D('Anantnag|Bandipora|Baramulla|Budgam|Doda|Ganderbal|Jammu|Kathua|Kishtwar|Kulgam|Kupwara|Poonch|Pulwama|Rajouri|Ramban|Reasi|Samba|Shopian|Srinagar|Udhampur'),
  'Jharkhand': D('Bokaro|Chatra|Deoghar|Dhanbad|Dumka|East Singhbhum|Garhwa|Giridih|Godda|Gumla|Hazaribagh|Jamtara|Khunti|Koderma|Latehar|Lohardaga|Pakur|Palamu|Ramgarh|Ranchi|Sahibganj|Seraikela Kharsawan|Simdega|West Singhbhum|Jamshedpur'),
  'Karnataka': D('Bagalkot|Ballari|Belagavi|Bengaluru|Bengaluru Rural|Bidar|Chamarajanagar|Chikkaballapur|Chikkamagaluru|Chitradurga|Dakshina Kannada|Davanagere|Dharwad|Gadag|Hassan|Haveri|Hubballi|Kalaburagi|Kodagu|Kolar|Koppal|Mandya|Mangaluru|Mysuru|Raichur|Ramanagara|Shivamogga|Tumakuru|Udupi|Uttara Kannada|Vijayanagara|Vijayapura|Yadgir'),
  'Kerala': D('Alappuzha|Ernakulam|Idukki|Kannur|Kasaragod|Kochi|Kollam|Kottayam|Kozhikode|Malappuram|Palakkad|Pathanamthitta|Thiruvananthapuram|Thrissur|Wayanad'),
  'Ladakh': D('Kargil|Leh'),
  'Lakshadweep': D('Kavaratti|Lakshadweep'),
  'Madhya Pradesh': D('Agar Malwa|Alirajpur|Anuppur|Ashoknagar|Balaghat|Barwani|Betul|Bhind|Bhopal|Burhanpur|Chhatarpur|Chhindwara|Damoh|Datia|Dewas|Dhar|Dindori|Guna|Gwalior|Harda|Indore|Jabalpur|Jhabua|Katni|Khandwa|Khargone|Mandla|Mandsaur|Morena|Narsinghpur|Neemuch|Niwari|Panna|Raisen|Rajgarh|Ratlam|Rewa|Sagar|Satna|Sehore|Seoni|Shahdol|Shajapur|Sheopur|Shivpuri|Sidhi|Singrauli|Tikamgarh|Ujjain|Umaria|Vidisha'),
  'Maharashtra': D('Ahmednagar|Akola|Amravati|Aurangabad|Beed|Bhandara|Buldhana|Chandrapur|Dhule|Gadchiroli|Gondia|Hingoli|Jalgaon|Jalna|Kolhapur|Latur|Mumbai|Mumbai Suburban|Nagpur|Nanded|Nandurbar|Nashik|Navi Mumbai|Osmanabad|Palghar|Parbhani|Pune|Raigad|Ratnagiri|Sangli|Satara|Sindhudurg|Solapur|Thane|Wardha|Washim|Yavatmal'),
  'Manipur': D('Bishnupur|Chandel|Churachandpur|Imphal East|Imphal West|Jiribam|Kakching|Kamjong|Kangpokpi|Noney|Pherzawl|Senapati|Tamenglong|Tengnoupal|Thoubal|Ukhrul'),
  'Meghalaya': D('East Garo Hills|East Jaintia Hills|East Khasi Hills|North Garo Hills|Ri Bhoi|Shillong|South Garo Hills|South West Garo Hills|South West Khasi Hills|West Garo Hills|West Jaintia Hills|West Khasi Hills'),
  'Mizoram': D('Aizawl|Champhai|Hnahthial|Khawzawl|Kolasib|Lawngtlai|Lunglei|Mamit|Saiha|Saitual|Serchhip'),
  'Nagaland': D('Chumoukedima|Dimapur|Kiphire|Kohima|Longleng|Mokokchung|Mon|Noklak|Peren|Phek|Tuensang|Wokha|Zunheboto'),
  'Odisha': D('Angul|Balangir|Balasore|Bargarh|Bhadrak|Bhubaneswar|Boudh|Cuttack|Deogarh|Dhenkanal|Gajapati|Ganjam|Jagatsinghpur|Jajpur|Jharsuguda|Kalahandi|Kandhamal|Kendrapara|Kendujhar|Khordha|Koraput|Malkangiri|Mayurbhanj|Nabarangpur|Nayagarh|Nuapada|Puri|Rayagada|Rourkela|Sambalpur|Subarnapur|Sundargarh'),
  'Puducherry': D('Karaikal|Mahe|Puducherry|Yanam'),
  'Punjab': D('Amritsar|Barnala|Bathinda|Faridkot|Fatehgarh Sahib|Fazilka|Ferozepur|Gurdaspur|Hoshiarpur|Jalandhar|Kapurthala|Ludhiana|Malerkotla|Mansa|Moga|Mohali|Muktsar|Pathankot|Patiala|Rupnagar|Sangrur|Shaheed Bhagat Singh Nagar|Tarn Taran'),
  'Rajasthan': D('Ajmer|Alwar|Banswara|Baran|Barmer|Bharatpur|Bhilwara|Bikaner|Bundi|Chittorgarh|Churu|Dausa|Dholpur|Dungarpur|Hanumangarh|Jaipur|Jaisalmer|Jalore|Jhalawar|Jhunjhunu|Jodhpur|Karauli|Kota|Nagaur|Pali|Pratapgarh|Rajsamand|Sawai Madhopur|Sikar|Sirohi|Sri Ganganagar|Tonk|Udaipur'),
  'Sikkim': D('Gangtok|Gyalshing|Mangan|Namchi|Pakyong|Soreng'),
  'Tamil Nadu': D('Ariyalur|Chengalpattu|Chennai|Coimbatore|Cuddalore|Dharmapuri|Dindigul|Erode|Kallakurichi|Kanchipuram|Kanyakumari|Karur|Krishnagiri|Madurai|Mayiladuthurai|Nagapattinam|Namakkal|Nilgiris|Perambalur|Pudukkottai|Ramanathapuram|Ranipet|Salem|Sivaganga|Tenkasi|Thanjavur|Theni|Thoothukudi|Tiruchirappalli|Tirunelveli|Tirupathur|Tiruppur|Tiruvallur|Tiruvannamalai|Tiruvarur|Vellore|Viluppuram|Virudhunagar|Hosur'),
  'Telangana': D('Adilabad|Bhadradri Kothagudem|Hyderabad|Hanumakonda|Jagtial|Jangaon|Jayashankar Bhupalpally|Jogulamba Gadwal|Kamareddy|Karimnagar|Khammam|Kumuram Bheem Asifabad|Mahabubabad|Mahabubnagar|Mancherial|Medak|Medchal-Malkajgiri|Mulugu|Nagarkurnool|Nalgonda|Narayanpet|Nirmal|Nizamabad|Peddapalli|Rajanna Sircilla|Rangareddy|Sangareddy|Secunderabad|Siddipet|Suryapet|Vikarabad|Wanaparthy|Warangal|Yadadri Bhuvanagiri'),
  'Tripura': D('Agartala|Dhalai|Gomati|Khowai|North Tripura|Sepahijala|South Tripura|Unakoti|West Tripura'),
  'Uttar Pradesh': D('Agra|Aligarh|Ambedkar Nagar|Amethi|Amroha|Auraiya|Ayodhya|Azamgarh|Baghpat|Bahraich|Ballia|Balrampur|Banda|Barabanki|Bareilly|Basti|Bhadohi|Bijnor|Budaun|Bulandshahr|Chandauli|Chitrakoot|Deoria|Etah|Etawah|Farrukhabad|Fatehpur|Firozabad|Ghaziabad|Ghazipur|Gonda|Gorakhpur|Greater Noida|Hamirpur|Hapur|Hardoi|Hathras|Jalaun|Jaunpur|Jhansi|Kannauj|Kanpur Dehat|Kanpur Nagar|Kasganj|Kaushambi|Kushinagar|Lakhimpur Kheri|Lalitpur|Lucknow|Maharajganj|Mahoba|Mainpuri|Mathura|Mau|Meerut|Mirzapur|Moradabad|Muzaffarnagar|Noida|Pilibhit|Pratapgarh|Prayagraj|Raebareli|Rampur|Saharanpur|Sambhal|Sant Kabir Nagar|Shahjahanpur|Shamli|Shravasti|Siddharthnagar|Sitapur|Sonbhadra|Sultanpur|Unnao|Varanasi'),
  'Uttarakhand': D('Almora|Bageshwar|Chamoli|Champawat|Dehradun|Haridwar|Nainital|Pauri Garhwal|Pithoragarh|Rudraprayag|Tehri Garhwal|Udham Singh Nagar|Uttarkashi|Haldwani'),
  'West Bengal': D('Alipurduar|Bankura|Birbhum|Cooch Behar|Dakshin Dinajpur|Darjeeling|Durgapur|Hooghly|Howrah|Jalpaiguri|Jhargram|Kalimpong|Kolkata|Malda|Murshidabad|Nadia|North 24 Parganas|Paschim Bardhaman|Paschim Medinipur|Purba Bardhaman|Purba Medinipur|Purulia|Siliguri|South 24 Parganas|Uttar Dinajpur'),
};

// Optional localities for major cities. Key format: "State|District".
const A = (s: string) => s.split('|').map(x => x.trim()).filter(Boolean).sort();
export const INDIA_AREAS: Record<string, string[]> = {
  'Tamil Nadu|Chennai': A('Adyar|Alandur|Ambattur|Anna Nagar|Ashok Nagar|Besant Nagar|Chromepet|Egmore|Guindy|K.K. Nagar|Kodambakkam|Kilpauk|Mylapore|Nungambakkam|OMR (Old Mahabalipuram Road)|Perambur|Perungudi|Porur|Sholinganallur|T. Nagar|Tambaram|Thiruvanmiyur|Velachery|Vadapalani|Washermanpet'),
  'Tamil Nadu|Madurai': A('Anna Nagar|Arapalayam|Goripalayam|K. Pudur|KK Nagar|Mattuthavani|Nagamalai Pudukottai|Narimedu|Periyar|Simmakkal|Sellur|SS Colony|Tallakulam|Thirunagar|Thirupparankundram|Vilangudi|Villapuram|Bypass Road'),
  'Tamil Nadu|Coimbatore': A('Gandhipuram|Peelamedu|RS Puram|Saibaba Colony|Singanallur|Race Course|Saravanampatti|Ukkadam|Vadavalli|Town Hall|Kuniyamuthur|Thudiyalur'),
  'Tamil Nadu|Tiruchirappalli': A('Cantonment|Srirangam|Thillai Nagar|K.K. Nagar|Woraiyur|Thennur|BHEL Township'),
  'Tamil Nadu|Salem': A('Fairlands|Hasthampatti|Suramangalam|Alagapuram|Ammapet|Five Roads'),
  'Maharashtra|Mumbai': A('Andheri|Bandra|BKC (Bandra Kurla Complex)|Borivali|Chembur|Colaba|Dadar|Fort|Goregaon|Kandivali|Lower Parel|Malad|Powai|Santacruz|Vikhroli|Worli|Ghatkopar|Mulund|Juhu'),
  'Maharashtra|Mumbai Suburban': A('Andheri|Bandra|Borivali|Chembur|Goregaon|Kandivali|Malad|Powai|Vikhroli|Ghatkopar|Mulund'),
  'Maharashtra|Navi Mumbai': A('Airoli|Belapur|Kharghar|Nerul|Panvel|Vashi|Turbhe|Ghansoli'),
  'Maharashtra|Thane': A('Ghodbunder Road|Kalyan|Majiwada|Naupada|Thane West|Wagle Estate|Dombivli'),
  'Maharashtra|Pune': A('Baner|Aundh|Hadapsar|Hinjewadi|Kalyani Nagar|Kharadi|Koregaon Park|Magarpatta|Pimpri-Chinchwad|Shivajinagar|Viman Nagar|Wakad|Deccan|Kothrud'),
  'Maharashtra|Nagpur': A('Dharampeth|Sadar|Sitabuldi|MIHAN|Manish Nagar|Wardha Road|Civil Lines'),
  'Karnataka|Bengaluru': A('Bellandur|BTM Layout|Electronic City|HSR Layout|Indiranagar|Jayanagar|JP Nagar|Koramangala|Malleshwaram|Marathahalli|Whitefield|Yelahanka|Hebbal|Rajajinagar|Banashankari|Sarjapur Road|Manyata Tech Park|MG Road'),
  'Karnataka|Mysuru': A('Vijayanagar|Kuvempunagar|Hebbal|Jayalakshmipuram|Bogadi|Saraswathipuram'),
  'Karnataka|Mangaluru': A('Hampankatta|Kadri|Bejai|Surathkal|Kankanady|Lalbagh'),
  'Telangana|Hyderabad': A('Ameerpet|Banjara Hills|Begumpet|Gachibowli|HITEC City|Jubilee Hills|Kondapur|Madhapur|Kukatpally|Miyapur|Uppal|Financial District|Nanakramguda|LB Nagar|Dilsukhnagar|Secunderabad'),
  'Telangana|Secunderabad': A('Begumpet|Bowenpally|Paradise|Trimulgherry|Tarnaka|Malkajgiri'),
  'Delhi|New Delhi': A('Connaught Place|Karol Bagh|Nehru Place|Lajpat Nagar|Chanakyapuri|Jor Bagh|Paharganj|Rajendra Place'),
  'Delhi|South Delhi': A('Saket|Hauz Khas|Greater Kailash|Vasant Kunj|Nehru Place|Malviya Nagar|Okhla|Lajpat Nagar|Kalkaji'),
  'Delhi|West Delhi': A('Janakpuri|Rajouri Garden|Punjabi Bagh|Tilak Nagar|Paschim Vihar|Uttam Nagar'),
  'Delhi|East Delhi': A('Laxmi Nagar|Preet Vihar|Mayur Vihar|Patparganj|Karkardooma'),
  'Delhi|North Delhi': A('Civil Lines|Model Town|Kamla Nagar|Burari|Azadpur'),
  'Uttar Pradesh|Noida': A('Sector 1|Sector 15|Sector 18|Sector 62|Sector 63|Sector 125|Sector 135|Sector 142|Film City|Noida Extension'),
  'Uttar Pradesh|Greater Noida': A('Alpha|Beta|Gamma|Knowledge Park|Pari Chowk|Greater Noida West'),
  'Uttar Pradesh|Ghaziabad': A('Indirapuram|Vaishali|Vasundhara|Raj Nagar|Kaushambi|Crossing Republik|Sahibabad'),
  'Uttar Pradesh|Lucknow': A('Gomti Nagar|Hazratganj|Aliganj|Alambagh|Indira Nagar|Aminabad|Chinhat|Jankipuram'),
  'Uttar Pradesh|Varanasi': A('Lanka|Sigra|Godowlia|Cantonment|Bhelupur|Sarnath'),
  'Haryana|Gurugram': A('Cyber City|DLF Phase 1|DLF Phase 2|DLF Phase 3|Golf Course Road|MG Road|Sohna Road|Udyog Vihar|Manesar|Sector 14|Sector 29|Sector 44|Sector 56'),
  'Haryana|Faridabad': A('Sector 15|NIT|Ballabgarh|Old Faridabad|Greater Faridabad'),
  'West Bengal|Kolkata': A('Salt Lake (Bidhannagar)|New Town|Park Street|Howrah Maidan|Ballygunge|Behala|Dum Dum|Garia|Gariahat|Jadavpur|Sector V|Rajarhat|Esplanade'),
  'Gujarat|Ahmedabad': A('Bodakdev|CG Road|Maninagar|Navrangpura|Prahlad Nagar|SG Highway|Satellite|Vastrapur|Gift City|Naroda'),
  'Gujarat|Surat': A('Adajan|Athwa|Piplod|Varachha|Vesu|Udhna|Katargam'),
  'Gujarat|Vadodara': A('Alkapuri|Akota|Manjalpur|Gotri|Fatehgunj|Karelibaug'),
  'Gujarat|Gandhinagar': A('Infocity|GIFT City|Sector 11|Kudasan|Sargasan'),
  'Rajasthan|Jaipur': A('C-Scheme|Malviya Nagar|Mansarovar|Vaishali Nagar|Jagatpura|Sitapura|Tonk Road|Bani Park|Sodala|Raja Park'),
  'Rajasthan|Jodhpur': A('Ratanada|Sardarpura|Shastri Nagar|Paota|Basni'),
  'Rajasthan|Udaipur': A('Fatehpura|Hiran Magri|Sukher|Bhupalpura|Pratap Nagar'),
  'Kerala|Kochi': A('Edappally|Kakkanad|Marine Drive|Panampilly Nagar|Vyttila|Fort Kochi|Infopark|Kaloor|Aluva'),
  'Kerala|Thiruvananthapuram': A('Technopark|Kowdiar|Pattom|Vazhuthacaud|Kazhakkoottam|Thampanoor|Vellayambalam'),
  'Kerala|Kozhikode': A('Mavoor Road|Palayam|Beach Road|Cyberpark|Nadakkavu'),
  'Kerala|Thrissur': A('Round South|Ayyanthole|Poonkunnam|Kuttanellur'),
  'Madhya Pradesh|Indore': A('Vijay Nagar|Palasia|Rau|Bhawarkuan|Sapna Sangeeta|Scheme 78|Super Corridor|Rajwada'),
  'Madhya Pradesh|Bhopal': A('Arera Colony|MP Nagar|New Market|Kolar Road|Bairagarh|Hoshangabad Road'),
  'Madhya Pradesh|Gwalior': A('City Centre|Lashkar|Morar|Thatipur'),
  'Madhya Pradesh|Jabalpur': A('Napier Town|Wright Town|Vijay Nagar|Madan Mahal'),
  'Bihar|Patna': A('Boring Road|Kankarbagh|Rajendra Nagar|Patliputra|Bailey Road|Danapur|Gandhi Maidan|Ashiana Nagar'),
  'Odisha|Bhubaneswar': A('Patia|Saheed Nagar|Jaydev Vihar|Chandrasekharpur|Nayapalli|Khandagiri|Old Town|Infocity'),
  'Odisha|Cuttack': A('Badambadi|Buxi Bazar|College Square|Link Road'),
  'Andhra Pradesh|Visakhapatnam': A('MVP Colony|Madhurawada|Gajuwaka|Dwaraka Nagar|Rushikonda|Seethammadhara|Siripuram'),
  'Andhra Pradesh|Vijayawada': A('Benz Circle|Governorpet|Labbipet|Auto Nagar|Patamata|Gunadala'),
  'Andhra Pradesh|Guntur': A('Brodipet|Arundelpet|Lakshmipuram|Nallapadu'),
  'Andhra Pradesh|Tirupati': A('Alipiri|Korlagunta|Renigunta|Tiruchanur|Air Bypass Road'),
  'Punjab|Ludhiana': A('Model Town|Sarabha Nagar|Civil Lines|Ferozepur Road|BRS Nagar|Dugri'),
  'Punjab|Amritsar': A('Ranjit Avenue|Lawrence Road|Mall Road|Majitha Road'),
  'Punjab|Jalandhar': A('Model Town|Adarsh Nagar|Civil Lines|Ladowali Road'),
  'Punjab|Mohali': A('Phase 1|Phase 5|Phase 7|Sector 70|Sector 74|IT City|Aerocity'),
  'Chandigarh|Chandigarh': A('Sector 17|Sector 22|Sector 34|Sector 35|Industrial Area Phase 1|Industrial Area Phase 2|Manimajra'),
  'Haryana|Panchkula': A('Sector 5|Sector 20|Sector 21|Industrial Area'),
  'Uttarakhand|Dehradun': A('Rajpur Road|Clement Town|Ballupur|Sahastradhara Road|Prem Nagar|Race Course|Patel Nagar'),
  'Jharkhand|Ranchi': A('Lalpur|Kanke Road|Harmu|Morabadi|Doranda|Bariatu|Main Road'),
  'Jharkhand|Jamshedpur': A('Bistupur|Sakchi|Sonari|Kadma|Telco'),
  'Assam|Guwahati': A('Beltola|Dispur|Ganeshguri|Paltan Bazaar|Six Mile|Zoo Road|Khanapara|Maligaon'),
  'Assam|Kamrup Metropolitan': A('Beltola|Dispur|Ganeshguri|Paltan Bazaar|Six Mile|Zoo Road|Khanapara|Maligaon'),
  'Chhattisgarh|Raipur': A('Shankar Nagar|Telibandha|Pandri|Devendra Nagar|Civil Lines|Naya Raipur'),
  'Goa|Panaji': A('Miramar|Porvorim|Campal|Taleigao|Dona Paula'),
  'Himachal Pradesh|Shimla': A('Mall Road|Sanjauli|Chotta Shimla|Summer Hill|Lakkar Bazaar'),
  'Jammu and Kashmir|Srinagar': A('Lal Chowk|Rajbagh|Hyderpora|Jawahar Nagar|Bemina'),
  'Jammu and Kashmir|Jammu': A('Gandhi Nagar|Trikuta Nagar|Channi Himmat|Talab Tillo|Bakshi Nagar'),
};

export const INDIA_STATES: string[] = Object.keys(INDIA_DISTRICTS).sort((a, b) => a.localeCompare(b));

export const getDistricts = (state: string): string[] =>
  state && INDIA_DISTRICTS[state] ? [...INDIA_DISTRICTS[state]].sort((a, b) => a.localeCompare(b)) : [];

export const getAreas = (state: string, district: string): string[] =>
  state && district ? INDIA_AREAS[`${state}|${district}`] || [] : [];

/** "Mattuthavani, Madurai, Tamil Nadu" / "Madurai, Tamil Nadu" */
export const formatLocation = (state?: string | null, district?: string | null, area?: string | null): string =>
  [area, district, state].map(p => (p || '').trim()).filter(Boolean).join(', ');

export interface LocationFilter {
  state: string;
  district: string;
  area: string;
}

interface LocatedJob {
  location?: string | null;
  state?: string | null;
  district?: string | null;
  area?: string | null;
}

const norm = (v?: string | null) => (v || '').trim().toLowerCase();

/**
 * Location filter used by the job search.
 * - No state selected: everything matches (filter off).
 * - New jobs (structured state/district): State + District, plus Area when both sides have one.
 * - Old jobs (only a free-text `location`): matched by text so they keep working.
 */
export const jobMatchesLocation = (job: LocatedJob, f: LocationFilter): boolean => {
  if (!f.state) return true;

  if (job.state) {
    if (norm(job.state) !== norm(f.state)) return false;
    if (!f.district) return true;
    if (norm(job.district) !== norm(f.district)) return false;
    if (f.area && job.area) return norm(job.area) === norm(f.area);
    return true;
  }

  // Legacy free-text location
  const text = norm(job.location);
  if (!text) return false;
  if (f.district) {
    if (!text.includes(norm(f.district))) return false;
    const otherState = INDIA_STATES.find(s => norm(s) !== norm(f.state) && text.includes(norm(s)));
    if (otherState) return false;
    return true;
  }
  return text.includes(norm(f.state));
};
