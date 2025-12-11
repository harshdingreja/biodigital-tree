import React, { useState } from 'react'
import { Play, RotateCcw, CheckCircle, Users, Database, Code } from 'lucide-react'
import './App.css'

const BioDigitalTree = () => {
  // Load Space Mono font
  React.useEffect(() => {
    const link = document.createElement('link')
    link.href = 'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)
    document.body.style.fontFamily = "'Space Mono', monospace"

    return () => {
      document.body.style.fontFamily = ''
    }
  }, [])

  const [currentPhase, setCurrentPhase] = useState(1)
  const [language, setLanguage] = useState('python')
  const [code, setCode] = useState('')
  const [output, setOutput] = useState('')
  const [slotAFilled, setSlotAFilled] = useState(false)
  const [slotBFilled, setSlotBFilled] = useState(false)
  const [errors, setErrors] = useState([])

  const rawData = [
    { name: 'Ashok', age: 85, relation: 'Head of Family' },
    { name: 'Rajesh', age: 58, relation: "Ashok's Son (Player 1's parent)" },
    { name: 'Seema', age: 48, relation: "Ashok's Daughter (Player 2's parent)" },
    { name: 'Rohan', age: 18, relation: "Rajesh's Son" },
    { name: 'Sam', age: 24, relation: "Rajesh's Son (Missing - Slot A)" },
    { name: 'Anjali', age: 22, relation: "Seema's Daughter" },
    { name: 'Vikram', age: 26, relation: "Seema's Son (Missing - Slot B)" },
  ]

  const codeTemplates = {
    phase1: {
      python: `# Write your Python program here`,
      java: `// Write your Java program here`,
      c: `// Write your C program here`,
      cpp: `// Write your C++ program here`,
    },
    phase2: {
      python: `# Write your Python program here`,
      java: `// Write your Java program here`,
      c: `// Write your C program here`,
      cpp: `// Write your C++ program here`,
    },
  }

  const handleLanguageChange = (lang) => {
    setLanguage(lang)
    const phase = currentPhase === 1 ? 'phase1' : 'phase2'
    setCode(codeTemplates[phase][lang])
    setErrors([])
  }

  const handlePhaseChange = () => {
    switchPhase(2)
  }

  const analyzeCode = () => {
    const lines = code.split('\n')
    const foundErrors = []
    const codeAnalysis = code.toLowerCase()

    // Basic syntax checking based on language
    if (language === 'python') {
      lines.forEach((line, index) => {
        const trimmed = line.trim()
        if (trimmed.includes('if') && !trimmed.endsWith(':') && trimmed.length > 2) {
          foundErrors.push({
            line: index + 1,
            message: "SyntaxError: Missing ':' at end of if statement",
            severity: 'error',
          })
        }
        if (trimmed.match(/print\s+[^(]/)) {
          foundErrors.push({
            line: index + 1,
            message: 'SyntaxError: print requires parentheses in Python 3',
            severity: 'error',
          })
        }
      })
    } else if (language === 'java') {
      lines.forEach((line, index) => {
        const trimmed = line.trim()
        if (trimmed.includes('if') && trimmed.includes('(') && !trimmed.includes(')')) {
          foundErrors.push({
            line: index + 1,
            message: "SyntaxError: Missing closing parenthesis ')'",
            severity: 'error',
          })
        }
        if (
          (trimmed.includes('int') || trimmed.includes('String')) &&
          !trimmed.endsWith(';') &&
          !trimmed.endsWith('{') &&
          trimmed.length > 3
        ) {
          foundErrors.push({
            line: index + 1,
            message: "SyntaxError: Missing semicolon ';' at end of statement",
            severity: 'error',
          })
        }
        if (trimmed.includes('System.out.println') && !trimmed.includes('(')) {
          foundErrors.push({
            line: index + 1,
            message: 'SyntaxError: Missing opening parenthesis after println',
            severity: 'error',
          })
        }
      })
    } else if (language === 'c' || language === 'cpp') {
      lines.forEach((line, index) => {
        const trimmed = line.trim()
        if (
          (trimmed.includes('int') || trimmed.includes('char') || trimmed.includes('float')) &&
          !trimmed.endsWith(';') &&
          !trimmed.endsWith('{') &&
          !trimmed.startsWith('//') &&
          trimmed.length > 3
        ) {
          foundErrors.push({
            line: index + 1,
            message: "SyntaxError: Missing semicolon ';' at end of statement",
            severity: 'error',
          })
        }
        if (trimmed.includes('printf') && !trimmed.includes('(')) {
          foundErrors.push({
            line: index + 1,
            message: 'SyntaxError: Missing opening parenthesis after printf',
            severity: 'error',
          })
        }
      })
    }

    // Logic warnings
    if (currentPhase === 1) {
      if (!codeAnalysis.includes('sam') && !codeAnalysis.includes('24')) {
        foundErrors.push({
          line: 0,
          message: "Warning: Code doesn't reference Sam or age 24",
          severity: 'warning',
        })
      }
      if (!codeAnalysis.includes('rajesh') && !codeAnalysis.includes('parent')) {
        foundErrors.push({
          line: 0,
          message: "Warning: Code doesn't reference Rajesh as parent",
          severity: 'warning',
        })
      }
    } else {
      if (!codeAnalysis.includes('vikram') && !codeAnalysis.includes('26')) {
        foundErrors.push({
          line: 0,
          message: "Warning: Code doesn't reference Vikram or age 26",
          severity: 'warning',
        })
      }
      if (!codeAnalysis.includes('seema') && !codeAnalysis.includes('parent')) {
        foundErrors.push({
          line: 0,
          message: "Warning: Code doesn't reference Seema as parent",
          severity: 'warning',
        })
      }
    }

    return foundErrors
  }

  const runCode = () => {
    // First, analyze for errors
    const foundErrors = analyzeCode()
    setErrors(foundErrors)

    // Check for critical errors
    const hasCriticalErrors = foundErrors.some((err) => err.severity === 'error')

    if (hasCriticalErrors) {
      let errorOutput = '❌ Compilation Failed!\\n\\n'
      errorOutput += '══════════════════════════════════════\\n'
      errorOutput += 'ERRORS FOUND:\\n'
      errorOutput += '══════════════════════════════════════\\n\\n'

      foundErrors.forEach((error, index) => {
        if (error.severity === 'error') {
          errorOutput += `${index + 1}. ${error.line > 0 ? `Line ${error.line}` : 'General'}: ${error.message}\\n\\n`
        }
      })

      errorOutput += '══════════════════════════════════════\\n'
      errorOutput += 'Please fix these errors and try again.'

      setOutput(errorOutput)
      return
    }

    // Check for warnings
    const hasWarnings = foundErrors.some((err) => err.severity === 'warning')
    let warningText = ''

    if (hasWarnings) {
      warningText = '\\n\\n⚠️ WARNINGS:\\n'
      foundErrors.forEach((error) => {
        if (error.severity === 'warning') {
          warningText += `• ${error.message}\\n`
        }
      })
    }

    // If no critical errors, check logic
    if (currentPhase === 1) {
      const codeAnalysis = code.toLowerCase()

      if (
        (codeAnalysis.includes('sam') || codeAnalysis.includes('24')) &&
        (codeAnalysis.includes('rajesh') || codeAnalysis.includes('parent')) &&
        (codeAnalysis.includes('child') || codeAnalysis.includes('son') || codeAnalysis.includes('==') || codeAnalysis.includes('equals'))
      ) {
        setSlotAFilled(true)
        setOutput(
          `✓ Success! Player 1 code executed!

Sam (24) correctly placed in Slot A as Rajesh's child.

Analysis: Your code identified Rajesh as parent and assigned Sam beneath him.
Position: Generation 3 → Rajesh's branch (Slot A).

✅ Player 1 complete!${warningText}`,
        )
      } else {
        setOutput(
          "⚠ Logic Error: Code runs but doesn't solve the problem correctly.\\n\\nRemember:\\n- Sam is 24 years old\\n- Parent is Rajesh (Generation 2)\\n- Check if parent name matches \"Rajesh\"\\n- Add Sam as child of Rajesh" +
            warningText,
        )
      }
    } else {
      const codeAnalysis = code.toLowerCase()

      if (
        (codeAnalysis.includes('vikram') || codeAnalysis.includes('26')) &&
        (codeAnalysis.includes('seema') || codeAnalysis.includes('parent')) &&
        (codeAnalysis.includes('child') || codeAnalysis.includes('son') || codeAnalysis.includes('==') || codeAnalysis.includes('equals'))
      ) {
        setSlotBFilled(true)
        setOutput(
          `✓ Success! Player 2 code executed!

Vikram (26) correctly placed in Slot B as Seema's child.

Analysis: Your code identified Seema as parent and assigned Vikram beneath her.
Position: Generation 3 → Seema's branch (Slot B).

🎉 Both branches restored!${warningText}`,
        )
      } else {
        setOutput(
          "⚠ Logic Error: Code runs but doesn't solve the problem correctly.\\n\\nRemember:\\n- Vikram is 26 years old\\n- Parent is Seema (Generation 2)\\n- Check if parent name matches \"Seema\"\\n- Add Vikram as child of Seema" +
            warningText,
        )
      }
    }
  }

  const switchPhase = (phase) => {
    const phaseKey = phase === 1 ? 'phase1' : 'phase2'
    setCurrentPhase(phase)
    setCode(codeTemplates[phaseKey][language])
    setOutput('')
    setErrors([])
  }

  const reset = () => {
    setCode(codeTemplates.phase1[language])
    setOutput('')
    setSlotAFilled(false)
    setSlotBFilled(false)
    setCurrentPhase(1)
    setErrors([])
  }

  // Initialize code on mount
  React.useEffect(() => {
    setCode(codeTemplates.phase1[language])
  }, [])

  return (
    <div
      className="min-h-screen bg-black p-8"
      style={{ fontFamily: "'Space Mono', monospace" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-black rounded-lg shadow-2xl p-6 mb-6 border-4 border-red-600 shadow-red-900/50">
          <h1 className="text-5xl font-bold text-red-600 mb-3 flex items-center gap-3 drop-shadow-[0_0_12px_rgba(220,38,38,1)] tracking-wider font-mono">
            <Users className="w-12 h-12 text-red-600 drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
            THE BIO-DIGITAL TREE
          </h1>
          <p className="text-green-400 font-mono text-lg drop-shadow-[0_0_8px_rgba(34,197,94,0.6)] tracking-wider">GENEALOGY & MEDICAL DATABASE RECOVERY CHALLENGE</p>
          <div className="mt-4 flex gap-4">
            <span
              className={`px-4 py-2 rounded-full border-2 font-bold font-mono tracking-wider ${
                currentPhase === 1
                  ? 'bg-black text-red-400 shadow-lg shadow-red-600/50 border-red-600 drop-shadow-[0_0_6px_rgba(220,38,38,0.6)]'
                  : 'bg-black text-gray-500 border-gray-700'
              }`}
            >
              PLAYER 1: SLOT A (RAJESH ➜ SAM)
            </span>
            <span
              className={`px-4 py-2 rounded-full border-2 font-bold font-mono tracking-wider ${
                currentPhase === 2
                  ? 'bg-black text-green-400 shadow-lg shadow-green-600/50 border-green-600 drop-shadow-[0_0_6px_rgba(34,197,94,0.6)]'
                  : 'bg-black text-gray-500 border-gray-700'
              }`}
            >
              PLAYER 2: SLOT B (SEEMA ➜ VIKRAM)
            </span>
          </div>
          <div className="mt-3 flex gap-2 text-xs">
            <button
              onClick={() => switchPhase(1)}
              className={`px-3 py-1 rounded border-2 font-mono font-bold tracking-wider ${
                currentPhase === 1
                  ? 'bg-black border-red-600 text-red-400 shadow-red-600/50 drop-shadow-[0_0_4px_rgba(220,38,38,0.6)]'
                  : 'bg-black border-gray-700 text-gray-400 hover:border-red-600 hover:text-red-400'
              }`}
            >
              JUMP TO PLAYER 1
            </button>
            <button
              onClick={() => switchPhase(2)}
              className={`px-3 py-1 rounded border-2 font-mono font-bold tracking-wider ${
                currentPhase === 2
                  ? 'bg-black border-green-600 text-green-400 shadow-green-600/50 drop-shadow-[0_0_4px_rgba(34,197,94,0.6)]'
                  : 'bg-black border-gray-700 text-gray-400 hover:border-green-600 hover:text-green-400'
              }`}
            >
              JUMP TO PLAYER 2
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* Tree Visualization Panel */}
          <div className="bg-black rounded-lg shadow-2xl p-6 border-2 border-red-600 shadow-red-900/30">
            <h2 className="text-2xl font-bold text-red-600 mb-4 flex items-center gap-2 drop-shadow-[0_0_6px_rgba(220,38,38,0.6)]">
              <Users className="w-6 h-6" />
              Corrupted Family Tree
            </h2>

            {/* Tree Visualization */}
            <div className="bg-black rounded-xl p-8 mb-6 relative border-2 border-green-600 shadow-2xl shadow-green-900/20">
              <div className="absolute top-4 right-4 flex gap-2 text-xs flex-wrap">
                <span className="flex items-center gap-1 bg-black px-3 py-1.5 rounded-full shadow-sm border border-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-400 font-semibold font-mono">Confirmed</span>
                </span>
                <span className="flex items-center gap-1 bg-black px-3 py-1.5 rounded-full shadow-sm border border-red-600">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-400 font-semibold font-mono">Missing</span>
                </span>
                <span className="flex items-center gap-1 bg-black px-3 py-1.5 rounded-full shadow-sm border border-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-300 font-semibold font-mono">Restored</span>
                </span>
              </div>

              <div className="text-center text-green-400 text-sm mb-4 font-mono drop-shadow-[0_0_6px_rgba(34,197,94,0.6)] tracking-wider">
                (SLOT A IS RAJESH'S CHILD — PLAYER 1) • (SLOT B IS SEEMA'S CHILD — PLAYER 2)
              </div>

              <div className="relative w-full h-[600px]">
                {/* connectors via svg for clean T-shaped lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Ashok to Rajesh/Seema */}
                  <line x1="50" y1="10" x2="50" y2="24" stroke="#22c55e" strokeWidth="0.8" opacity="0.8" />
                  <line x1="25" y1="24" x2="75" y2="24" stroke="#22c55e" strokeWidth="0.8" opacity="0.8" />
                  <line x1="30" y1="24" x2="30" y2="38" stroke="#22c55e" strokeWidth="0.8" opacity="0.8" />
                  <line x1="70" y1="24" x2="70" y2="38" stroke="#22c55e" strokeWidth="0.8" opacity="0.8" />

                  {/* Rajesh to his kids (T) */}
                  <line x1="30" y1="38" x2="30" y2="52" stroke="#22c55e" strokeWidth="0.8" opacity="0.8" />
                  <line x1="18" y1="52" x2="42" y2="52" stroke="#22c55e" strokeWidth="0.8" opacity="0.8" />
                  <line x1="20" y1="52" x2="20" y2="72" stroke="#22c55e" strokeWidth="0.8" opacity="0.8" />
                  <line x1="40" y1="52" x2="40" y2="72" stroke="#22c55e" strokeWidth="0.8" opacity="0.8" />

                  {/* Seema to her kids (T) */}
                  <line x1="70" y1="38" x2="70" y2="52" stroke="#22c55e" strokeWidth="0.8" opacity="0.8" />
                  <line x1="56" y1="52" x2="84" y2="52" stroke="#22c55e" strokeWidth="0.8" opacity="0.8" />
                  <line x1="60" y1="52" x2="60" y2="72" stroke="#22c55e" strokeWidth="0.8" opacity="0.8" />
                  <line x1="80" y1="52" x2="80" y2="72" stroke="#22c55e" strokeWidth="0.8" opacity="0.8" />
                </svg>

                {/* Ashok */}
                <div className="absolute left-1/2 -translate-x-1/2 top-2 flex flex-col items-center">
                  <div className="text-[10px] font-bold text-green-400 mb-1 font-mono">GEN 1</div>
                  <div className="bg-black text-green-400 px-7 py-3 rounded-xl font-bold shadow-lg text-center border-2 border-green-600 min-w-[140px] shadow-green-600/50">
                    <div className="text-base">Ashok</div>
                    <div className="text-xs opacity-90">Age 85</div>
                  </div>
                </div>

                {/* Rajesh */}
                <div className="absolute left-[30%] -translate-x-1/2 top-[150px] flex flex-col items-center">
                  <div className="text-[10px] font-bold text-green-400 mb-1 font-mono">GEN 2</div>
                  <div className="bg-black text-green-400 px-7 py-3 rounded-xl font-bold shadow-lg text-center border-2 border-green-600 min-w-[150px] shadow-green-600/50">
                    <div className="text-base">Rajesh</div>
                    <div className="text-xs opacity-90">Age 58</div>
                  </div>
                </div>

                {/* Seema */}
                <div className="absolute left-[70%] -translate-x-1/2 top-[150px] flex flex-col items-center">
                  <div className="text-[10px] font-bold text-green-400 mb-1 font-mono">GEN 2</div>
                  <div className="bg-black text-green-400 px-7 py-3 rounded-xl font-bold shadow-lg text-center border-2 border-green-600 min-w-[150px] shadow-green-600/50">
                    <div className="text-base">Seema</div>
                    <div className="text-xs opacity-90">Age 48</div>
                  </div>
                </div>

                {/* Rohan */}
                <div className="absolute left-[20%] -translate-x-1/2 top-[400px] flex flex-col items-center">
                  <div className="text-[10px] font-bold text-green-400 mb-1 font-mono drop-shadow-[0_0_4px_rgba(34,197,94,0.6)]">GEN 3</div>
                  <div className="bg-black text-green-400 px-5 py-3 rounded-lg font-semibold shadow-lg text-center min-w-[140px] border-2 border-green-600 shadow-green-600/50">
                    <div className="text-sm">Rohan</div>
                    <div className="text-xs opacity-90">Age 18</div>
                  </div>
                  <div className="text-[10px] text-green-500 mt-1 font-medium font-mono">Rajesh's child</div>
                </div>

                {/* Slot A (Player 1) */}
                <div className="absolute left-[40%] -translate-x-1/2 top-[400px] flex flex-col items-center">
                  <div className="text-[10px] font-bold text-red-400 mb-1 font-mono drop-shadow-[0_0_4px_rgba(220,38,38,0.6)]">GEN 3</div>
                  <div
                    className={`${
                      slotAFilled ? 'bg-black text-green-400 border-2 border-green-600 shadow-green-600/50' : 'bg-black text-red-400 border-2 border-red-600 shadow-red-600/50'
                    } px-5 py-3 rounded-lg font-semibold shadow-lg text-center min-w-[140px] relative`}
                  >
                    {slotAFilled ? (
                      <>
                        <div className="text-sm drop-shadow-[0_0_6px_rgba(34,197,94,0.8)]">Sam</div>
                        <div className="text-xs opacity-90">Age 24</div>
                      </>
                    ) : (
                      <>
                        <div className="text-sm tracking-wider drop-shadow-[0_0_6px_rgba(220,38,38,0.8)]">SLOT A</div>
                        <div className="text-xs opacity-90">CORRUPTED</div>
                      </>
                    )}
                    {!slotAFilled && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]"></div>}
                  </div>
                  <div className="text-[10px] text-red-500 mt-1 font-medium font-mono">Rajesh's child (Player 1)</div>
                </div>

                {/* Slot B (Player 2) */}
                <div className="absolute left-[60%] -translate-x-1/2 top-[400px] flex flex-col items-center">
                  <div className="text-[10px] font-bold text-green-400 mb-1 font-mono drop-shadow-[0_0_4px_rgba(34,197,94,0.6)]">GEN 3</div>
                  <div
                    className={`${
                      slotBFilled ? 'bg-black text-green-400 border-2 border-green-600 shadow-green-600/50' : 'bg-black text-red-400 border-2 border-red-600 shadow-red-600/50'
                    } px-5 py-3 rounded-lg font-semibold shadow-lg text-center min-w-[140px] relative`}
                  >
                    {slotBFilled ? (
                      <>
                        <div className="text-sm drop-shadow-[0_0_6px_rgba(34,197,94,0.8)]">Vikram</div>
                        <div className="text-xs opacity-90">Age 26</div>
                      </>
                    ) : (
                      <>
                        <div className="text-sm tracking-wider drop-shadow-[0_0_6px_rgba(220,38,38,0.8)]">SLOT B</div>
                        <div className="text-xs opacity-90">CORRUPTED</div>
                      </>
                    )}
                    {!slotBFilled && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]"></div>}
                  </div>
                  <div className="text-[10px] text-green-500 mt-1 font-medium font-mono">Seema's child (Player 2)</div>
                </div>

                {/* Anjali */}
                <div className="absolute left-[80%] -translate-x-1/2 top-[400px] flex flex-col items-center">
                  <div className="text-[10px] font-bold text-green-400 mb-1 font-mono drop-shadow-[0_0_4px_rgba(34,197,94,0.6)]">GEN 3</div>
                  <div className="bg-black text-green-400 px-5 py-3 rounded-lg font-semibold shadow-lg text-center min-w-[140px] border-2 border-green-600 shadow-green-600/50">
                    <div className="text-sm">Anjali</div>
                    <div className="text-xs opacity-90">Age 22</div>
                  </div>
                  <div className="text-[10px] text-green-500 mt-1 font-medium font-mono">Seema's child</div>
                </div>
              </div>
            </div>

            {/* Rules */}
            <div className="bg-black border-2 border-green-600 rounded-lg p-4 shadow-green-900/30">
              <h3 className="font-bold text-green-400 mb-3 font-mono text-lg drop-shadow-[0_0_6px_rgba(34,197,94,0.6)] tracking-wider">RULES:</h3>
              <ul className="space-y-3 text-sm text-green-300 font-mono">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold drop-shadow-[0_0_4px_rgba(220,38,38,0.6)]">1.</span>
                  <span>
                    <strong className="text-green-400">LINEAGE RULE:</strong> Children are linked directly BELOW their Parent
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold drop-shadow-[0_0_4px_rgba(220,38,38,0.6)]">2.</span>
                  <span>
                    <strong className="text-green-400">SENIORITY RULE:</strong> Siblings arranged by Age - Younger LEFT → Older RIGHT
                  </span>
                </li>
              </ul>
            </div>

            {/* Raw Data Table */}
            <div className="mt-6">
              <h3 className="font-bold text-green-400 mb-3 flex items-center gap-2 font-mono text-lg drop-shadow-[0_0_6px_rgba(34,197,94,0.6)] tracking-wider">
                <Database className="w-6 h-6 text-green-400 drop-shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
                RAW DATA TABLE
              </h3>
              <div className="overflow-x-auto rounded-lg border-2 border-green-600 shadow-green-900/30">
                <table className="w-full text-sm font-mono">
                  <thead className="bg-black border-b-2 border-green-600">
                    <tr>
                      <th className="px-4 py-2 text-left text-green-400 font-bold">NAME</th>
                      <th className="px-4 py-2 text-left text-green-400 font-bold">AGE</th>
                      <th className="px-4 py-2 text-left text-green-400 font-bold">RELATION</th>
                    </tr>
                  </thead>
                  <tbody className="bg-black">
                    {rawData.map((person, idx) => (
                      <tr
                        key={idx}
                        className={`border-b border-green-800/50 ${
                          person.relation.includes('Missing') ? 'bg-red-950/50 text-red-400 font-semibold' : 'text-green-300'
                        }`}
                      >
                        <td className="px-4 py-2">{person.name}</td>
                        <td className="px-4 py-2">{person.age}</td>
                        <td className="px-4 py-2">{person.relation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Panel: Code Editor */}
          <div className="bg-black rounded-lg shadow-2xl p-6 border-4 border-red-600 shadow-red-900/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-bold text-red-600 flex items-center gap-2 font-mono tracking-wider drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]">
                <Code className="w-7 h-7 text-red-600 drop-shadow-[0_0_8px_rgba(220,38,38,0.6)]" />
                CODE EDITOR
              </h2>
              <div className="flex gap-2">
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="px-3 py-2 border-2 border-red-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-black text-green-400 font-mono font-bold shadow-red-900/30"
                >
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="c">C</option>
                  <option value="cpp">C++</option>
                </select>
              </div>
            </div>

            {/* Current Task */}
            <div className="bg-black border-4 border-green-600 p-4 mb-4 rounded shadow-green-900/30">
              <h3 className="font-bold text-green-400 mb-2 font-mono text-lg drop-shadow-[0_0_6px_rgba(34,197,94,0.6)] tracking-wider">
                {currentPhase === 1 ? '🎯 PLAYER 1 TASK: FILL SLOT A (RAJESH ➜ SAM)' : '🎯 PLAYER 2 TASK: FILL SLOT B (SEEMA ➜ VIKRAM)'}
              </h3>
              <p className="text-sm text-green-300 font-mono">
                {currentPhase === 1
                  ? 'Write a program to confirm Rajesh is the parent and place Sam (24) as his child in Slot A.'
                  : 'Write a program to confirm Seema is the parent and place Vikram (26) as her child in Slot B.'}
              </p>
              <div className="mt-2 text-xs text-green-400 font-mono">
                TIP: Two-player mode — each player can jump to their slot with the buttons above and run their own code.
              </div>
            </div>

            {/* Code Editor */}
            <div className="relative">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-64 p-4 pl-12 font-mono text-sm border-4 border-green-600 rounded-lg focus:outline-none focus:ring-4 focus:ring-green-500 bg-black text-green-400 shadow-green-900/30"
                placeholder={`Write your ${language} code here...`}
                spellCheck="false"
              />
              {/* Line numbers */}
              <div className="absolute left-0 top-0 p-4 pointer-events-none">
                <div className="font-mono text-sm text-green-600/50 select-none">
                  {code.split('\n').map((_, i) => (
                    <div key={i} className="leading-6">
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={runCode}
                className="flex-1 bg-black border-2 border-red-600 hover:bg-red-950 text-red-400 px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-red-900/50 font-mono tracking-wider"
              >
                <Play className="w-5 h-5" />
                RUN CODE
              </button>
              {slotAFilled && currentPhase === 1 && (
                <button
                  onClick={handlePhaseChange}
                  className="flex-1 bg-black border-2 border-green-600 hover:bg-green-950 text-green-400 px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-green-900/50 font-mono tracking-wider"
                >
                  <CheckCircle className="w-5 h-5" />
                  NEXT PHASE
                </button>
              )}
              <button
                onClick={reset}
                className="bg-black border-2 border-red-600 hover:bg-red-950 text-red-400 px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-red-900/50 font-mono tracking-wider"
              >
                <RotateCcw className="w-5 h-5" />
                RESET
              </button>
            </div>

            {/* Output */}
            {output && (
              <div className="mt-4 bg-black text-green-400 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap border-2 border-green-600 shadow-green-900/30">
                <div className="flex items-start gap-2">
                  <span className="text-red-500 font-bold drop-shadow-[0_0_4px_rgba(220,38,38,0.6)]">$</span>
                  <div className="drop-shadow-[0_0_4px_rgba(34,197,94,0.4)]">{output}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 bg-black rounded-lg shadow-2xl p-6 border-4 border-red-600 shadow-red-900/50">
          <h3 className="font-bold text-red-600 mb-4 font-mono text-2xl tracking-wider drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]">GAME INSTRUCTIONS:</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm font-mono">
            <div className="bg-black border-2 border-green-600 p-4 rounded shadow-green-900/30">
                  <h4 className="font-bold text-green-400 mb-2 text-lg tracking-wider drop-shadow-[0_0_6px_rgba(34,197,94,0.6)]">PLAYER 1 (SLOT A - RAJESH ➜ SAM)</h4>
                  <p className="text-green-300">Write a program that confirms Rajesh is the parent and places Sam (24) under Rajesh in Slot A (Generation 3).</p>
            </div>
      <div className="bg-black border-2 border-green-600 p-4 rounded shadow-green-900/30">
                  <h4 className="font-bold text-green-400 mb-2 text-lg tracking-wider drop-shadow-[0_0_6px_rgba(34,197,94,0.6)]">PLAYER 2 (SLOT B - SEEMA ➜ VIKRAM)</h4>
                  <p className="text-green-300">Write a program that confirms Seema is the parent and places Vikram (26) under Seema in Slot B (Generation 3).</p>
            </div>
          </div>
      </div>
      </div>
    </div>
  )
}

export default BioDigitalTree
