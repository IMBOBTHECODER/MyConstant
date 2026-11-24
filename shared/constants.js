// Built-in constants
// -----------------------------------------
// Shown as copy buttons in the popup (the ones the user has included, see
// the helpers at the bottom); the ones marked `popular` are also
// offered in the quick picker when the user has no constants of their own.
//
// This is a classic script, not a module, so the popup, the background
// worker and the content script can all load it. It adds one global:
// MyConstantData.
//
// Each category becomes a section. To add a constant, add a row; to add a
// section, add a category (`wide: true` gives it two columns instead of
// three, for long labels).
//   symbol  plain-text form: used for search, messages and screen readers
//   latex   how the button is drawn (LaTeX subset, see shared/latex.js);
//           note that backslashes are doubled inside JavaScript strings
//   core    true for the essential ones, which are in the popup to begin
//           with; the rest wait in the library (library/) until added
//   medium  true for the middle slice of the essentials (the "Medium"
//           preset in the library, together with the popular ones)
//   popular true for the handful offered in the quick picker by default
//           (also the "Light" preset in the library)
//   name    what search and tooltips use, so put any word someone might
//           type there (e.g. "Pi", "sqrt")
//
// Simple multiples (pi/2, 2e, ...) are not listed: the coefficient box in
// the popup and the quick picker multiplies any constant on the way out.
//
// Mathematical values are stored to 30 decimal places. What is shown and
// copied is cut to the "decimal places" setting (see shared/format.js).
// Physical values are in SI units, as published by NIST (2022 CODATA
// adjustment), written so they paste straight into a calculator or code
// ("6.62607015e-34"). The unit is in the name. They are cut by the same
// setting but never padded: these are all the digits that are known.

globalThis.MyConstantData = {
  CATEGORIES: [
    {
      title: 'Mathematical constants',
      constants: [
        { core: true, popular: true, symbol: 'π', latex: '\\pi', name: 'Pi', value: '3.141592653589793238462643383279' },
        { core: true, popular: true, symbol: 'e', latex: 'e', name: "Euler's number", value: '2.718281828459045235360287471352' },
        { core: true, popular: true, symbol: 'φ', latex: '\\varphi', name: 'Golden ratio (phi)', value: '1.618033988749894848204586834365' },
        { core: true, medium: true, symbol: 'τ', latex: '\\tau', name: 'Tau (2 pi)', value: '6.283185307179586476925286766559' },
        { core: true, popular: true, symbol: '√2', latex: '\\sqrt{2}', name: 'Square root of 2 (sqrt 2)', value: '1.414213562373095048801688724209' },
        { core: true, medium: true, symbol: '√3', latex: '\\sqrt{3}', name: 'Square root of 3 (sqrt 3)', value: '1.732050807568877293527446341505' },
        { symbol: '√5', latex: '\\sqrt{5}', name: 'Square root of 5 (sqrt 5)', value: '2.236067977499789696409173668731' },
        { symbol: '∛2', latex: '\\sqrt[3]{2}', name: 'Cube root of 2 (cbrt 2)', value: '1.259921049894873164767210607278' },
        { symbol: '1/√2', latex: '\\frac{1}{\\sqrt{2}}', name: 'One over square root of 2 (1/sqrt 2)', value: '0.707106781186547524400844362104' },
        { core: true, medium: true, symbol: 'ln 2', latex: '\\ln 2', name: 'Natural log of 2', value: '0.693147180559945309417232121458' },
        { core: true, symbol: 'ln 10', latex: '\\ln 10', name: 'Natural log of 10', value: '2.302585092994045684017991454684' },
        { symbol: 'log e', latex: '\\log_{10} e', name: 'Base-10 log of e (log10 e)', value: '0.434294481903251827651128918916' },
        { symbol: 'log 2', latex: '\\log_{10} 2', name: 'Base-10 log of 2 (log10 2)', value: '0.301029995663981195213738894724' },
        { core: true, symbol: 'γ', latex: '\\gamma', name: 'Euler–Mascheroni constant (gamma)', value: '0.577215664901532860606512090082' },
        { symbol: 'π²', latex: '\\pi^2', name: 'Pi squared', value: '9.869604401089358618834490999876' },
        { symbol: '√π', latex: '\\sqrt{\\pi}', name: 'Square root of pi (sqrt pi)', value: '1.772453850905516027298167483341' },
        { symbol: '√2π', latex: '\\sqrt{2\\pi}', name: 'Square root of 2 pi (sqrt 2 pi)', value: '2.506628274631000502415765284811' },
        { symbol: '1/π', latex: '\\frac{1}{\\pi}', name: 'One over pi (reciprocal)', value: '0.318309886183790671537767526745' },
        { symbol: '1/e', latex: '\\frac{1}{e}', name: 'One over e (reciprocal)', value: '0.367879441171442321595523770161' },
        { symbol: 'eᵖⁱ', latex: 'e^{\\pi}', name: "Gelfond's constant (e to the pi)", value: '23.140692632779269005729086367948' },
        { symbol: 'G', latex: 'G', name: "Catalan's constant", value: '0.915965594177219015054603514932' },
        { symbol: 'ζ(3)', latex: '\\zeta(3)', name: "Apéry's constant (zeta 3)", value: '1.202056903159594285399738161511' },
        { core: true, medium: true, symbol: '°→rad', latex: '{}^{\\circ} \\to \\mathrm{rad}', name: 'Degrees to radians (pi / 180)', value: '0.017453292519943295769236907684' },
        { core: true, symbol: 'rad→°', latex: '\\mathrm{rad} \\to {}^{\\circ}', name: 'Radians to degrees (180 / pi)', value: '57.295779513082320876798154814105' },
        { symbol: '√7', latex: '\\sqrt{7}', name: 'Square root of 7 (sqrt 7)', value: '2.645751311064590590501615753639' },
        { symbol: '√10', latex: '\\sqrt{10}', name: 'Square root of 10 (sqrt 10)', value: '3.162277660168379331998893544432' },
        { symbol: '∛3', latex: '\\sqrt[3]{3}', name: 'Cube root of 3 (cbrt 3)', value: '1.442249570307408382321638310780' },
        { symbol: '√e', latex: '\\sqrt{e}', name: 'Square root of e (sqrt e)', value: '1.648721270700128146848650787814' },
        { symbol: 'e²', latex: 'e^2', name: 'e squared', value: '7.389056098930650227230427460575' },
        { symbol: 'πᵉ', latex: '\\pi^{e}', name: 'Pi to the e', value: '22.459157718361045473427152204543' },
        { symbol: 'ln 3', latex: '\\ln 3', name: 'Natural log of 3', value: '1.098612288668109691395245236922' },
        { symbol: 'ln π', latex: '\\ln \\pi', name: 'Natural log of pi', value: '1.144729885849400174143427351353' },
        { symbol: 'log₂ e', latex: '\\log_{2} e', name: 'Base-2 log of e (log2 e)', value: '1.442695040888963407359924681001' },
        { symbol: 'log₂ 10', latex: '\\log_{2} 10', name: 'Base-2 log of 10 (log2 10)', value: '3.321928094887362347870319429489' },
        { symbol: '1/φ', latex: '\\frac{1}{\\varphi}', name: 'Golden ratio conjugate (1 / phi)', value: '0.618033988749894848204586834365' },
        { symbol: 'δₛ', latex: '\\delta_{\\mathrm{S}}', name: 'Silver ratio (1 + sqrt 2)', value: '2.414213562373095048801688724209' },
        { symbol: 'ρ', latex: '\\rho', name: 'Plastic number', value: '1.324717957244746025960908854478' },
        { symbol: 'ζ(2)', latex: '\\zeta(2)', name: 'Basel constant (zeta 2, pi squared over 6)', value: '1.644934066848226436472415166646' },
        { symbol: 'K₀', latex: 'K_0', name: "Khinchin's constant", value: '2.685452001065306445309714835481' },
        { symbol: 'A', latex: 'A', name: 'Glaisher–Kinkelin constant', value: '1.282427129100622636875342568869' },
        { symbol: 'C₂', latex: 'C_2', name: 'Twin prime constant', value: '0.660161815846869573927812110014' },
        { symbol: 'M', latex: 'M', name: 'Meissel–Mertens constant', value: '0.261497212847642783755426838608' },
        { symbol: 'Ω', latex: '\\Omega', name: 'Omega constant (Lambert W of 1)', value: '0.567143290409783872999968662210' },
        { symbol: 'd', latex: 'd', name: 'Dottie number (cos x = x)', value: '0.739085133215160641655312087673' },
        { symbol: 'ϖ', latex: '\\varpi', name: 'Lemniscate constant', value: '2.622057554292119810464839589891' },
        { symbol: 'iⁱ', latex: 'i^{i}', name: 'i to the i (e to the minus pi over 2)', value: '0.207879576350761908546955619834' },
        { symbol: 'e^(π√163)', latex: 'e^{\\pi\\sqrt{163}}', name: "Ramanujan's constant (e to the pi sqrt 163)", value: '262537412640768743.999999999999250072597198185688' },
        { symbol: 'δ', latex: '\\delta', name: 'Feigenbaum constant delta', value: '4.669201609102990671853203820466' },
        { symbol: 'α', latex: '\\alpha_{\\mathrm{F}}', name: 'Feigenbaum constant alpha', value: '2.502907875095892822283902873218' },
      ],
    },
    {
      title: 'Physical constants',
      constants: [
        { core: true, popular: true, symbol: 'c', latex: 'c', name: 'Speed of light in vacuum (m/s)', value: '299792458' },
        { core: true, popular: true, symbol: 'h', latex: 'h', name: 'Planck constant (J·s)', value: '6.62607015e-34' },
        { core: true, medium: true, symbol: 'ħ', latex: '\\hbar', name: 'Reduced Planck constant, h-bar (J·s)', value: '1.054571817e-34' },
        { core: true, popular: true, symbol: 'k', latex: 'k_{\\mathrm{B}}', name: 'Boltzmann constant (J/K)', value: '1.380649e-23' },
        { core: true, popular: true, symbol: 'Nᴀ', latex: 'N_{\\mathrm{A}}', name: 'Avogadro constant (1/mol)', value: '6.02214076e23' },
        { core: true, popular: true, symbol: 'qₑ', latex: 'q_{\\mathrm{e}}', name: 'Elementary charge (C)', value: '1.602176634e-19' },
        { core: true, popular: true, symbol: 'G', latex: 'G', name: 'Newtonian constant of gravitation (m³/(kg·s²))', value: '6.67430e-11' },
        { core: true, popular: true, symbol: 'g', latex: 'g', name: 'Standard acceleration of gravity (m/s²)', value: '9.80665' },
        { core: true, popular: true, symbol: 'R', latex: 'R', name: 'Molar gas constant (J/(mol·K))', value: '8.314462618' },
        { core: true, medium: true, symbol: 'ε₀', latex: '\\varepsilon_0', name: 'Vacuum electric permittivity, epsilon 0 (F/m)', value: '8.8541878188e-12' },
        { core: true, medium: true, symbol: 'μ₀', latex: '\\mu_0', name: 'Vacuum magnetic permeability, mu 0 (N/A²)', value: '1.25663706127e-6' },
        { core: true, medium: true, symbol: 'mₑ', latex: 'm_{\\mathrm{e}}', name: 'Electron mass (kg)', value: '9.1093837139e-31' },
        { core: true, medium: true, symbol: 'mₚ', latex: 'm_{\\mathrm{p}}', name: 'Proton mass (kg)', value: '1.67262192595e-27' },
        { core: true, symbol: 'mₙ', latex: 'm_{\\mathrm{n}}', name: 'Neutron mass (kg)', value: '1.67492750056e-27' },
        { core: true, symbol: 'u', latex: 'u', name: 'Atomic mass constant (kg)', value: '1.66053906892e-27' },
        { core: true, symbol: 'σ', latex: '\\sigma', name: 'Stefan–Boltzmann constant, sigma (W/(m²·K⁴))', value: '5.670374419e-8' },
        { symbol: 'α', latex: '\\alpha', name: 'Fine-structure constant, alpha (no unit)', value: '7.2973525643e-3' },
        { symbol: 'F', latex: 'F', name: 'Faraday constant (C/mol)', value: '96485.33212' },
        { symbol: 'R∞', latex: 'R_{\\infty}', name: 'Rydberg constant (1/m)', value: '10973731.568157' },
        { symbol: 'a₀', latex: 'a_0', name: 'Bohr radius (m)', value: '5.29177210544e-11' },
        { symbol: 'b', latex: 'b', name: 'Wien displacement constant (m·K)', value: '2.897771955e-3' },
        { core: true, medium: true, symbol: 'eV', latex: '\\mathrm{eV}', name: 'Electron volt (J)', value: '1.602176634e-19' },
        { core: true, medium: true, symbol: 'atm', latex: '\\mathrm{atm}', name: 'Standard atmosphere (Pa)', value: '101325' },
        { symbol: 'ℓP', latex: '\\ell_{\\mathrm{P}}', name: 'Planck length (m)', value: '1.616255e-35' },
        { symbol: 'mP', latex: 'm_{\\mathrm{P}}', name: 'Planck mass (kg)', value: '2.176434e-8' },
        { symbol: 'tP', latex: 't_{\\mathrm{P}}', name: 'Planck time (s)', value: '5.391247e-44' },
        { symbol: 'TP', latex: 'T_{\\mathrm{P}}', name: 'Planck temperature (K)', value: '1.416784e32' },
        { symbol: 'μB', latex: '\\mu_{\\mathrm{B}}', name: 'Bohr magneton (J/T)', value: '9.2740100657e-24' },
        { symbol: 'μN', latex: '\\mu_{\\mathrm{N}}', name: 'Nuclear magneton (J/T)', value: '5.0507837393e-27' },
        { symbol: 'Φ₀', latex: '\\Phi_0', name: 'Magnetic flux quantum (Wb)', value: '2.067833848e-15' },
        { symbol: 'G₀', latex: 'G_0', name: 'Conductance quantum (S)', value: '7.748091729e-5' },
        { symbol: 'RK', latex: 'R_{\\mathrm{K}}', name: 'von Klitzing constant (ohm)', value: '25812.80745' },
        { symbol: 'KJ', latex: 'K_{\\mathrm{J}}', name: 'Josephson constant (Hz/V)', value: '483597.8484e9' },
        { symbol: 'Z₀', latex: 'Z_0', name: 'Impedance of free space, vacuum (ohm)', value: '376.730313412' },
        { symbol: 'rₑ', latex: 'r_{\\mathrm{e}}', name: 'Classical electron radius (m)', value: '2.8179403205e-15' },
        { symbol: 'λC', latex: '\\lambda_{\\mathrm{C}}', name: 'Compton wavelength of the electron (m)', value: '2.42631023538e-12' },
        { symbol: 'σₑ', latex: '\\sigma_{\\mathrm{e}}', name: 'Thomson cross section (m²)', value: '6.6524587051e-29' },
        { symbol: 'Eh', latex: 'E_{\\mathrm{h}}', name: 'Hartree energy (J)', value: '4.3597447222060e-18' },
        { symbol: 'Ry', latex: '\\mathrm{Ry}', name: 'Rydberg energy, hydrogen ionisation (eV)', value: '13.605693122990' },
        { symbol: '1/α', latex: '\\frac{1}{\\alpha}', name: 'Inverse fine-structure constant, about 137 (no unit)', value: '137.035999177' },
        { symbol: 'mₚ/mₑ', latex: '\\frac{m_{\\mathrm{p}}}{m_{\\mathrm{e}}}', name: 'Proton to electron mass ratio (no unit)', value: '1836.152673426' },
        { symbol: 'c₁', latex: 'c_1', name: 'First radiation constant (W·m²)', value: '3.741771852e-16' },
        { symbol: 'c₂', latex: 'c_2', name: 'Second radiation constant (m·K)', value: '1.438776877e-2' },
        { symbol: "b'", latex: "b'", name: 'Wien frequency displacement constant (Hz/K)', value: '5.878925757e10' },
        { symbol: 'mₑc²', latex: 'm_{\\mathrm{e}}c^2', name: 'Electron rest energy (MeV)', value: '0.51099895069' },
        { symbol: 'mₚc²', latex: 'm_{\\mathrm{p}}c^2', name: 'Proton rest energy (MeV)', value: '938.27208943' },
        { symbol: 'mₙc²', latex: 'm_{\\mathrm{n}}c^2', name: 'Neutron rest energy (MeV)', value: '939.56542194' },
        { symbol: 'mμ', latex: 'm_{\\mu}', name: 'Muon mass (kg)', value: '1.883531627e-28' },
        { symbol: 'm_d', latex: 'm_{\\mathrm{d}}', name: 'Deuteron mass (kg)', value: '3.3435837768e-27' },
        { symbol: 'mα', latex: 'm_{\\alpha}', name: 'Alpha particle mass (kg)', value: '6.6446573450e-27' },
        { symbol: 'k', latex: 'k_{\\mathrm{eV}}', name: 'Boltzmann constant (eV/K)', value: '8.617333262e-5' },
        { symbol: 'h', latex: 'h_{\\mathrm{eV}}', name: 'Planck constant (eV·s)', value: '4.135667696e-15' },
        { symbol: 'ħ', latex: '\\hbar_{\\mathrm{eV}}', name: 'Reduced Planck constant, h-bar (eV·s)', value: '6.582119569e-16' },
        { symbol: 'kₑ', latex: 'k_{\\mathrm{e}}', name: 'Coulomb constant, 1/(4 pi epsilon 0) (N·m²/C²)', value: '8.987551786e9' },
      ],
    },
    {
      // SI units, NIST 2022 CODATA values unless the name says otherwise.
      title: 'Chemistry constants',
      constants: [
        { core: true, medium: true, symbol: 'Vₘ', latex: 'V_{\\mathrm{m,atm}}', name: 'Molar volume of ideal gas at 0 °C, 1 atm (m³/mol)', value: '22.41396954e-3' },
        { symbol: 'Vₘ', latex: 'V_{\\mathrm{m,bar}}', name: 'Molar volume of ideal gas at 0 °C, 1 bar (m³/mol)', value: '22.71095464e-3' },
        { core: true, symbol: 'R', latex: 'R_{\\mathrm{atm}}', name: 'Molar gas constant (L·atm/(mol·K))', value: '0.082057366' },
        { symbol: 'Mᵤ', latex: 'M_{\\mathrm{u}}', name: 'Molar mass constant (kg/mol)', value: '1.00000000105e-3' },
        { symbol: 'M(¹²C)', latex: 'M_{\\mathrm{C}}', name: 'Molar mass of carbon-12 (kg/mol)', value: '12.0000000126e-3' },
        { symbol: 'n₀', latex: 'n_0', name: 'Loschmidt constant at 0 °C, 1 atm (1/m³)', value: '2.686780111e25' },
        { symbol: 'u', latex: 'u_{\\mathrm{MeV}}', name: 'Atomic mass unit energy equivalent, dalton (MeV)', value: '931.49410372' },
        { core: true, symbol: 'T₀', latex: 'T_0', name: 'Zero Celsius in kelvin, standard temperature (K)', value: '273.15' },
        { symbol: 'ρ', latex: '\\rho_{\\mathrm{w}}', name: 'Density of water at 4 °C (kg/m³)', value: '999.972' },
        { symbol: 'c', latex: 'c_{\\mathrm{w}}', name: 'Specific heat of water, about (J/(kg·K))', value: '4184' },
        { symbol: 'Kw', latex: 'K_{\\mathrm{w}}', name: 'Ion product of water at 25 °C, about (no unit)', value: '1.0e-14' },
        { symbol: 'mₚ', latex: 'm_{\\mathrm{p,u}}', name: 'Proton mass (u)', value: '1.0072764665789' },
        { symbol: 'mₙ', latex: 'm_{\\mathrm{n,u}}', name: 'Neutron mass (u)', value: '1.00866491606' },
        { symbol: 'mₑ', latex: 'm_{\\mathrm{e,u}}', name: 'Electron mass (u)', value: '5.485799090441e-4' },
        { symbol: 'Eh', latex: 'E_{\\mathrm{h,eV}}', name: 'Hartree energy (eV)', value: '27.211386245981' },
        { symbol: 'p°', latex: 'p^{\\circ}', name: 'Standard-state pressure, 1 bar (Pa)', value: '100000' },
        { symbol: 'R', latex: 'R_{\\mathrm{cal}}', name: 'Molar gas constant (cal/(mol·K))', value: '1.987204258' },
        { symbol: 'eV', latex: '\\mathrm{eV}_{\\mathrm{mol}}', name: 'Electron volt per particle (kJ/mol)', value: '96.48533212' },
        { symbol: 'T', latex: 'T_{25}', name: 'Room temperature, 25 °C (K)', value: '298.15' },
        { symbol: 'Tₜₚ', latex: 'T_{\\mathrm{tp}}', name: 'Triple point of water (K)', value: '273.16' },
      ],
    },
    {
      // SI units. au, light-year and parsec are exact by definition; solar
      // values are the IAU 2015 nominal ones; the rest are measured.
      title: 'Astronomical constants',
      constants: [
        { core: true, medium: true, symbol: 'au', latex: '\\mathrm{au}', name: 'Astronomical unit (m)', value: '149597870700' },
        { core: true, medium: true, symbol: 'ly', latex: '\\mathrm{ly}', name: 'Light-year (m)', value: '9.4607304725808e15' },
        { core: true, symbol: 'pc', latex: '\\mathrm{pc}', name: 'Parsec (m)', value: '3.085677581491367278913937957796e16' },
        { core: true, symbol: 'M☉', latex: 'M_{\\odot}', name: 'Solar mass, sun (kg)', value: '1.98841e30' },
        { symbol: 'R☉', latex: 'R_{\\odot}', name: 'Solar radius, sun (m)', value: '6.957e8' },
        { symbol: 'L☉', latex: 'L_{\\odot}', name: 'Solar luminosity, sun (W)', value: '3.828e26' },
        { symbol: 'GM☉', latex: 'GM_{\\odot}', name: 'Solar gravitational parameter, sun (m³/s²)', value: '1.32712440018e20' },
        { core: true, symbol: 'M⊕', latex: 'M_{\\oplus}', name: 'Earth mass (kg)', value: '5.9722e24' },
        { core: true, symbol: 'R⊕', latex: 'R_{\\oplus}', name: 'Earth equatorial radius (m)', value: '6378137' },
        { symbol: 'GM⊕', latex: 'GM_{\\oplus}', name: 'Earth gravitational parameter (m³/s²)', value: '3.986004418e14' },
        { symbol: 'M☾', latex: 'M_{\\mathrm{Moon}}', name: 'Moon mass (kg)', value: '7.346e22' },
        { symbol: 'd☾', latex: 'd_{\\mathrm{Moon}}', name: 'Earth–Moon mean distance (m)', value: '3.844e8' },
        { symbol: 'M♃', latex: 'M_{\\mathrm{Jup}}', name: 'Jupiter mass (kg)', value: '1.89813e27' },
        { symbol: 'S', latex: 'S_{\\odot}', name: 'Solar constant, sunlight at Earth (W/m²)', value: '1361' },
        { symbol: 'T', latex: 'T_{\\mathrm{CMB}}', name: 'Cosmic microwave background temperature (K)', value: '2.7255' },
        { symbol: 'yr', latex: '\\mathrm{yr}', name: 'Julian year (s)', value: '31557600' },
        { symbol: 'd', latex: '\\mathrm{d}_{\\mathrm{sid}}', name: 'Sidereal day (s)', value: '86164.0905' },
        { symbol: 'T☉', latex: 'T_{\\odot}', name: 'Solar effective temperature, sun surface (K)', value: '5772' },
        { symbol: 'R⊕', latex: 'R_{\\oplus\\mathrm{p}}', name: 'Earth polar radius (m)', value: '6356752' },
        { symbol: 'R⊕', latex: 'R_{\\oplus\\mathrm{m}}', name: 'Earth mean radius (m)', value: '6371000' },
        { symbol: 'v', latex: 'v_{\\mathrm{esc}}', name: 'Earth escape velocity (m/s)', value: '11186' },
        { symbol: 'R☾', latex: 'R_{\\mathrm{Moon}}', name: 'Moon mean radius (m)', value: '1737400' },
        { symbol: 'R♃', latex: 'R_{\\mathrm{Jup}}', name: 'Jupiter equatorial radius (m)', value: '7.1492e7' },
        { symbol: 'GM♃', latex: 'GM_{\\mathrm{Jup}}', name: 'Jupiter gravitational parameter (m³/s²)', value: '1.2668653e17' },
        { symbol: 'M☿', latex: 'M_{\\mathrm{Mer}}', name: 'Mercury mass (kg)', value: '3.30e23' },
        { symbol: 'M♀', latex: 'M_{\\mathrm{Ven}}', name: 'Venus mass (kg)', value: '4.87e24' },
        { symbol: 'M♂', latex: 'M_{\\mathrm{Mars}}', name: 'Mars mass (kg)', value: '6.42e23' },
        { symbol: 'M♄', latex: 'M_{\\mathrm{Sat}}', name: 'Saturn mass (kg)', value: '5.68e26' },
        { symbol: 'M⛢', latex: 'M_{\\mathrm{Ura}}', name: 'Uranus mass (kg)', value: '8.68e25' },
        { symbol: 'M♆', latex: 'M_{\\mathrm{Nep}}', name: 'Neptune mass (kg)', value: '1.02e26' },
      ],
    },
    {
      // Multiply by the value to convert. All exact by definition, except
      // the two with repeating decimals, which are stored to 30 places.
      title: 'Unit conversions',
      wide: true,
      constants: [
        { core: true, medium: true, symbol: 'in→m', latex: '\\mathrm{in} \\to \\mathrm{m}', name: 'Inches to metres', value: '0.0254' },
        { core: true, symbol: 'ft→m', latex: '\\mathrm{ft} \\to \\mathrm{m}', name: 'Feet to metres', value: '0.3048' },
        { core: true, medium: true, symbol: 'mi→m', latex: '\\mathrm{mi} \\to \\mathrm{m}', name: 'Miles to metres', value: '1609.344' },
        { symbol: 'nmi→m', latex: '\\mathrm{nmi} \\to \\mathrm{m}', name: 'Nautical miles to metres', value: '1852' },
        { symbol: 'acre→m²', latex: '\\mathrm{acre} \\to \\mathrm{m}^2', name: 'Acres to square metres', value: '4046.8564224' },
        { symbol: 'gal→L', latex: '\\mathrm{gal} \\to \\mathrm{L}', name: 'US gallons to litres', value: '3.785411784' },
        { core: true, medium: true, symbol: 'lb→kg', latex: '\\mathrm{lb} \\to \\mathrm{kg}', name: 'Pounds to kilograms', value: '0.45359237' },
        { symbol: 'oz→kg', latex: '\\mathrm{oz} \\to \\mathrm{kg}', name: 'Ounces to kilograms', value: '0.028349523125' },
        { core: true, symbol: 'km/h→m/s', latex: '\\mathrm{km/h} \\to \\mathrm{m/s}', name: 'Kilometres per hour to metres per second (kph)', value: '0.277777777777777777777777777777' },
        { symbol: 'mph→m/s', latex: '\\mathrm{mph} \\to \\mathrm{m/s}', name: 'Miles per hour to metres per second', value: '0.44704' },
        { symbol: 'kn→m/s', latex: '\\mathrm{kn} \\to \\mathrm{m/s}', name: 'Knots to metres per second', value: '0.514444444444444444444444444444' },
        { core: true, symbol: 'cal→J', latex: '\\mathrm{cal} \\to \\mathrm{J}', name: 'Calories to joules (thermochemical)', value: '4.184' },
        { symbol: 'kWh→J', latex: '\\mathrm{kWh} \\to \\mathrm{J}', name: 'Kilowatt-hours to joules', value: '3600000' },
        { symbol: 'BTU→J', latex: '\\mathrm{BTU} \\to \\mathrm{J}', name: 'British thermal units to joules (IT)', value: '1055.05585262' },
        { symbol: 'hp→W', latex: '\\mathrm{hp} \\to \\mathrm{W}', name: 'Horsepower to watts (mechanical)', value: '745.69987158227022' },
        { symbol: 'psi→Pa', latex: '\\mathrm{psi} \\to \\mathrm{Pa}', name: 'Pounds per square inch to pascals', value: '6894.757293168361' },
        { symbol: 'mmHg→Pa', latex: '\\mathrm{mmHg} \\to \\mathrm{Pa}', name: 'Millimetres of mercury to pascals (torr)', value: '133.322387415' },
        { symbol: 'yd→m', latex: '\\mathrm{yd} \\to \\mathrm{m}', name: 'Yards to metres', value: '0.9144' },
        { symbol: 'm→ft', latex: '\\mathrm{m} \\to \\mathrm{ft}', name: 'Metres to feet', value: '3.280839895013123359580052493438' },
        { symbol: 'm→in', latex: '\\mathrm{m} \\to \\mathrm{in}', name: 'Metres to inches', value: '39.370078740157480314960629921259' },
        { symbol: 'km→mi', latex: '\\mathrm{km} \\to \\mathrm{mi}', name: 'Kilometres to miles', value: '0.621371192237333969617434184363' },
        { symbol: 'kg→lb', latex: '\\mathrm{kg} \\to \\mathrm{lb}', name: 'Kilograms to pounds', value: '2.20462262184877580722973801345' },
        { symbol: 'L→gal', latex: '\\mathrm{L} \\to \\mathrm{gal}', name: 'Litres to US gallons', value: '0.264172052358148415379899921609' },
        { symbol: 'ft²→m²', latex: '\\mathrm{ft}^2 \\to \\mathrm{m}^2', name: 'Square feet to square metres', value: '0.09290304' },
        { symbol: 'mi²→m²', latex: '\\mathrm{mi}^2 \\to \\mathrm{m}^2', name: 'Square miles to square metres', value: '2589988.110336' },
        { symbol: 'ft³→m³', latex: '\\mathrm{ft}^3 \\to \\mathrm{m}^3', name: 'Cubic feet to cubic metres', value: '0.028316846592' },
        { symbol: 'fl oz→mL', latex: '\\mathrm{fl oz} \\to \\mathrm{mL}', name: 'US fluid ounces to millilitres', value: '29.5735295625' },
        { symbol: 'pt→L', latex: '\\mathrm{pt} \\to \\mathrm{L}', name: 'US pints to litres', value: '0.473176473' },
        { symbol: 'imp gal→L', latex: '\\mathrm{imp gal} \\to \\mathrm{L}', name: 'Imperial gallons to litres', value: '4.54609' },
        { symbol: 'st→kg', latex: '\\mathrm{st} \\to \\mathrm{kg}', name: 'Stone to kilograms', value: '6.35029318' },
        { symbol: 'ton→kg', latex: '\\mathrm{ton} \\to \\mathrm{kg}', name: 'Short tons to kilograms (US ton)', value: '907.18474' },
        { symbol: 'long ton→kg', latex: '\\mathrm{long ton} \\to \\mathrm{kg}', name: 'Long tons to kilograms (imperial ton)', value: '1016.0469088' },
        { symbol: 'oz t→kg', latex: '\\mathrm{oz t} \\to \\mathrm{kg}', name: 'Troy ounces to kilograms', value: '0.0311034768' },
        { symbol: 'lbf→N', latex: '\\mathrm{lbf} \\to \\mathrm{N}', name: 'Pounds-force to newtons', value: '4.4482216152605' },
        { symbol: 'kgf→N', latex: '\\mathrm{kgf} \\to \\mathrm{N}', name: 'Kilograms-force to newtons', value: '9.80665' },
        { symbol: 'ft·lbf→J', latex: '\\mathrm{ft·lbf} \\to \\mathrm{J}', name: 'Foot-pounds to joules', value: '1.3558179483314004' },
        { symbol: 'kcal→J', latex: '\\mathrm{kcal} \\to \\mathrm{J}', name: 'Kilocalories to joules (food calories)', value: '4184' },
        { symbol: 'PS→W', latex: '\\mathrm{PS} \\to \\mathrm{W}', name: 'Metric horsepower to watts', value: '735.49875' },
        { symbol: 'Torr→Pa', latex: '\\mathrm{Torr} \\to \\mathrm{Pa}', name: 'Torr to pascals', value: '133.322368421052631578947368421052' },
        { symbol: 'inHg→Pa', latex: '\\mathrm{inHg} \\to \\mathrm{Pa}', name: 'Inches of mercury to pascals', value: '3386.388640341' },
        { symbol: 'rpm→rad/s', latex: '\\mathrm{rpm} \\to \\mathrm{rad/s}', name: 'Revolutions per minute to radians per second', value: '0.104719755119659774615421446109' },
        { symbol: '°F→K', latex: '{}^{\\circ}\\mathrm{F} \\to \\mathrm{K}', name: 'Fahrenheit degree size in kelvins (5/9)', value: '0.555555555555555555555555555555' },
        { symbol: 'd→s', latex: '\\mathrm{d} \\to \\mathrm{s}', name: 'Days to seconds', value: '86400' },
      ],
    },
  ],
};

// Which built-in constants the popup shows
// -----------------------------------------
// The `core` ones by default. The user changes that in the library page,
// and the differences are saved in two settings (shared/settings.js):
//   added   keys of non-core constants switched on
//   hidden  keys of core constants switched off

/** Identifies a built-in constant (two share the symbol "G"). */
MyConstantData.keyOf = (constant) => `${constant.symbol}|${constant.value}`;

/** True if the constant is in the popup, given the settings. */
MyConstantData.isIncluded = (constant, settings) => {
  const list = constant.core ? settings.hidden : settings.added;
  const listed = Array.isArray(list) && list.includes(MyConstantData.keyOf(constant));
  return constant.core ? !listed : listed;
};

/** CATEGORIES cut down to the included constants; empty categories dropped. */
MyConstantData.included = (settings) =>
  MyConstantData.CATEGORIES.map((category) => ({
    ...category,
    constants: category.constants.filter((c) => MyConstantData.isIncluded(c, settings)),
  })).filter((category) => category.constants.length > 0);

// Presets
// -----------------------------------------
// Ready-made selections, offered as buttons on the library page, in two
// groups. "Essentials" (the `core` constants) comes in three sizes:
//   Light   only the `popular` ones (a dozen)
//   Medium  those plus the ones marked `medium` (about thirty)
//   All     every `core` constant — the default selection
// "Subjects" are everything in one field plus the essentials of related
// ones. "Everything", in a group of its own, is the whole library.
//
// Each preset names the categories to include in full (`all`) and those to
// include only a slice of: the `core` constants (`core`), the popular and
// medium ones (`medium`) or only the popular ones (`popular`). Categories
// it does not mention are left out. To add a preset, add a row.
const EVERY_CATEGORY = ['Mathematical constants', 'Physical constants', 'Chemistry constants', 'Astronomical constants', 'Unit conversions'];
MyConstantData.PRESETS = [
  { group: 'Essentials', title: 'Light', popular: EVERY_CATEGORY },
  { group: 'Essentials', title: 'Medium', medium: EVERY_CATEGORY },
  { group: 'Essentials', title: 'All', core: EVERY_CATEGORY },
  { group: 'Subjects', title: 'Mathematics', all: ['Mathematical constants'] },
  {
    group: 'Subjects',
    title: 'Physics',
    all: ['Physical constants'],
    core: ['Mathematical constants', 'Astronomical constants', 'Unit conversions'],
  },
  {
    group: 'Subjects',
    title: 'Chemistry',
    all: ['Chemistry constants'],
    core: ['Mathematical constants', 'Physical constants'],
  },
  {
    group: 'Subjects',
    title: 'Astronomy',
    all: ['Astronomical constants'],
    core: ['Mathematical constants', 'Physical constants'],
  },
  {
    group: 'Subjects',
    title: 'Engineering',
    all: ['Unit conversions'],
    core: ['Mathematical constants', 'Physical constants'],
  },
  { group: '', title: 'Everything', all: EVERY_CATEGORY },
];

/** The { added, hidden } settings that select exactly what a preset names. */
MyConstantData.presetSelection = (preset) => {
  const added = [];
  const hidden = [];
  for (const category of MyConstantData.CATEGORIES) {
    const all = preset.all?.includes(category.title);
    const coreOnly = preset.core?.includes(category.title);
    const mediumOnly = preset.medium?.includes(category.title);
    const popularOnly = preset.popular?.includes(category.title);
    for (const constant of category.constants) {
      const wanted =
        all ||
        (coreOnly && constant.core === true) ||
        (mediumOnly && (constant.medium === true || constant.popular === true)) ||
        (popularOnly && constant.popular === true);
      if (wanted && !constant.core) added.push(MyConstantData.keyOf(constant));
      if (!wanted && constant.core) hidden.push(MyConstantData.keyOf(constant));
    }
  }
  return { added, hidden };
};
