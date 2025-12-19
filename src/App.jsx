

import React, { useState } from 'react'
import { Play, RotateCcw, CheckCircle, Users, Database, Code, Lightbulb, AlertTriangle } from 'lucide-react'
import './App.css'

// TreeNode class for BST
class TreeNode {
  constructor(name, age, relation) {
    this.name = name
    this.age = age
    this.relation = relation
    this.left = null
    this.right = null
  }
}

// Initialize the family tree structure
const initializeTree = () => {
  // Generation 1: Ashok (root)
  const ashok = new TreeNode('Ashok', 85, 'Head of Family')
  
  // Generation 2: Rajesh and Seema (Ashok's children)
  const rajesh = new TreeNode('Rajesh', 58, "Ashok's Son")
  const seema = new TreeNode('Seema', 48, "Ashok's Daughter")
  
  // Ashok's children (younger on left, older on right based on age)
  ashok.left = seema  // Seema is younger (48)
  ashok.right = rajesh // Rajesh is older (58)
  
  // Generation 3: Rajesh's children
  const rohan = new TreeNode('Rohan', 18, "Rajesh's Son")
  rajesh.left = rohan // Rohan is youngest
  
  // Generation 3: Seema's children  
  const anjali = new TreeNode('Anjali', 22, "Seema's Daughter")
  seema.right = anjali // Anjali on right
  
  return ashok
}

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
  const [player1Language, setPlayer1Language] = useState('python')
  const [player2Language, setPlayer2Language] = useState('python')
  const [player1Code, setPlayer1Code] = useState('')
  const [player2Code, setPlayer2Code] = useState('')
  const [output, setOutput] = useState('')

  const [slotAFilled, setSlotAFilled] = useState(false)
  const [slotBFilled, setSlotBFilled] = useState(false)
  const [errors, setErrors] = useState([])
  const [hintStep, setHintStep] = useState(0) // 0 = not clicked, 1 = confirming, 2 = showing hint
  const [hintMessage, setHintMessage] = useState('')
  const [hintTimeout, setHintTimeout] = useState(null)
  const [familyTree, setFamilyTree] = useState(initializeTree())
  const [timeRemaining, setTimeRemaining] = useState(600) // 10 minutes in seconds
  const [timerActive, setTimerActive] = useState(true)

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
      python: `# Player 1: Insert Sam into the tree
# Write your BST insertion algorithm here
`,
      java: `// Player 1: Insert Sam into the tree
// Write your BST insertion algorithm here
`,
      c: `// Player 1: Insert Sam into the tree
// Write your BST insertion algorithm here
`,
      cpp: `// Player 1: Insert Sam into the tree
// Write your BST insertion algorithm here
`,
    },
    phase2: {
      python: `# Player 2: Insert Vikram into the tree
# Write your BST insertion algorithm here
`,
      java: `// Player 2: Insert Vikram into the tree
// Write your BST insertion algorithm here
`,
      c: `// Player 2: Insert Vikram into the tree
// Write your BST insertion algorithm here
`,
      cpp: `// Player 2: Insert Vikram into the tree
// Write your BST insertion algorithm here
`,
    },
  }

  const handleLanguageChange = (lang) => {
    if (currentPhase === 1) {
      setPlayer1Language(lang)
      setPlayer1Code(codeTemplates.phase1[lang])
    } else {
      setPlayer2Language(lang)
      setPlayer2Code(codeTemplates.phase2[lang])
    }
    setErrors([])
  }

  const handlePhaseChange = () => {
    switchPhase(2)
  }

  const analyzeCode = () => {
    const code = currentPhase === 1 ? player1Code : player2Code
    const language = currentPhase === 1 ? player1Language : player2Language
    const lines = code.split('\n')
    const foundErrors = []
    const codeAnalysis = code.toLowerCase()

    // Basic syntax checking based on language
    if (language === 'python') {
      lines.forEach((line, index) => {
        const trimmed = line.trim()
        if (trimmed.includes('if') && !trimmed.endsWith(':') && !trimmed.includes('//') && trimmed.length > 2) {
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

    // NEW: Check for BST insertion logic patterns
    const hasBSTLogic = (
      // Check for age comparison
      (codeAnalysis.includes('age') && (codeAnalysis.includes('<') || codeAnalysis.includes('>'))) ||
      // Check for left/right navigation
      (codeAnalysis.includes('left') && codeAnalysis.includes('right')) ||
      // Check for comparison operators with node/age
      codeAnalysis.includes('compare')
    )

    if (!hasBSTLogic) {
      foundErrors.push({
        line: 0,
        message: 'Warning: Code should include age comparison and left/right tree navigation',
        severity: 'warning',
      })
    }

    // Logic warnings specific to each phase
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
    // Check if time is up
    if (timeRemaining <= 0) {
      setOutput('⏰ TIME UP! Cannot run code. Click RESET to start a new challenge.')
      return
    }

    const code = currentPhase === 1 ? player1Code : player2Code
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

    // Check for BST logic patterns
    const codeAnalysis = code.toLowerCase()
    const hasBSTLogic = (
      (codeAnalysis.includes('age') && (codeAnalysis.includes('<') || codeAnalysis.includes('>'))) ||
      (codeAnalysis.includes('left') && codeAnalysis.includes('right'))
    )

    // If no critical errors, validate BST insertion logic
    if (currentPhase === 1) {
      // Player 1: Insert Sam under Rajesh
      const hasCorrectLogic = (
        (codeAnalysis.includes('sam') || codeAnalysis.includes('24')) &&
        (codeAnalysis.includes('rajesh') || codeAnalysis.includes('parent')) &&
        hasBSTLogic
      )

      if (hasCorrectLogic) {
        // Perform actual tree insertion
        const tree = familyTree
        const rajesh = tree.right // Rajesh is on the right of Ashok
        const sam = new TreeNode('Sam', 24, "Rajesh's Son")
        
        // Insert Sam based on BST rules (Sam:24 > Rohan:18, so goes right)
        if (rajesh.left) {
          rajesh.left.right = sam // Sam goes to the right of Rohan
        }
        
        setSlotAFilled(true)
        setFamilyTree({...tree}) // Trigger re-render
        
        setOutput(
          `✓ Success! Player 1 BST Insertion Complete!

🌳 BST Logic Validated:
- Found parent: Rajesh (age 58)
- Inserting child: Sam (age 24)
- Age comparison: 24 < 58 → Navigate left subtree
- Position: Sam placed correctly in Generation 3

✅ Player 1 complete!${warningText}`,
        )
      } else {
        setOutput(
          "⚠ Logic Error: BST insertion logic incomplete.\\n\\nYour code must:\\n1. Find parent node (Rajesh)\\n2. Compare ages (Sam: 24 vs siblings)\\n3. Navigate left/right based on comparison\\n4. Insert Sam in correct position" +
            warningText,
        )
      }
    } else {
      // Player 2: Insert Vikram under Seema
      const hasCorrectLogic = (
        (codeAnalysis.includes('vikram') || codeAnalysis.includes('26')) &&
        (codeAnalysis.includes('seema') || codeAnalysis.includes('parent')) &&
        hasBSTLogic
      )

      if (hasCorrectLogic) {
        // Perform actual tree insertion
        const tree = familyTree
        const seema = tree.left // Seema is on the left of Ashok
        const vikram = new TreeNode('Vikram', 26, "Seema's Son")
        
        // Insert Vikram based on BST rules (Vikram:26 > Anjali:22, stays right)
        if (seema.right) {
          seema.right.right = vikram // Vikram goes to the right of Anjali
        }
        
        setSlotBFilled(true)
        setFamilyTree({...tree}) // Trigger re-render
        
        setOutput(
          `✓ Success! Player 2 BST Insertion Complete!

🌳 BST Logic Validated:
- Found parent: Seema (age 48)
- Inserting child: Vikram (age 26)
- Age comparison: 26 < 48 → Navigate left subtree
- Position: Vikram placed correctly in Generation 3

🎉 Both branches restored!${warningText}`,
        )
      } else {
        setOutput(
          "⚠ Logic Error: BST insertion logic incomplete.\\n\\nYour code must:\\n1. Find parent node (Seema)\\n2. Compare ages (Vikram: 26 vs siblings)\\n3. Navigate left/right based on comparison\\n4. Insert Vikram in correct position" +
            warningText,
        )
      }
    }
  }


  const switchPhase = (phase) => {
    setCurrentPhase(phase)
    setOutput('')
    setErrors([])
    setHintStep(0) // Reset hint step when switching phases
    setHintMessage('') // Clear hint message

    // Clear any pending hint timeout
    if (hintTimeout) {
      clearTimeout(hintTimeout)
      setHintTimeout(null)
    }
  }


  const reset = () => {
    setPlayer1Code(codeTemplates.phase1[player1Language])
    setPlayer2Code(codeTemplates.phase2[player2Language])
    setOutput('')
    setSlotAFilled(false)
    setSlotBFilled(false)
    setCurrentPhase(1)
    setErrors([])
    setFamilyTree(initializeTree()) // Reset the tree structure
  }

  const getHint = () => {
    // Clear any existing timeout
    if (hintTimeout) {
      clearTimeout(hintTimeout)
    }

    if (hintStep === 0) {
      // First click - show confirmation
      setHintStep(1)

      // Set timeout to reset after 5 seconds
      const timeout = setTimeout(() => {
        setHintStep(0)
        setHintTimeout(null)
      }, 5000)

      setHintTimeout(timeout)
    } else if (hintStep === 1) {
      // Second click - show hint
      setHintStep(2)

      // Clear the timeout since user confirmed
      if (hintTimeout) {
        clearTimeout(hintTimeout)
        setHintTimeout(null)
      }

      let hint = ''
      if (currentPhase === 1) {
        hint = '💡 HINT: Find Rajesh (parent), compare Sam\'s age (24) with Rohan (18). Since 24 > 18, Sam goes RIGHT of Rohan.'
      } else {
        hint = '💡 HINT: Find Seema (parent), compare Vikram\'s age (26) with Anjali (22). Since 26 > 22, Vikram goes RIGHT of Anjali.'
      }

      setHintMessage(hint)
    }
  }


  // Initialize code on mount
  React.useEffect(() => {
    setPlayer1Code(codeTemplates.phase1[player1Language])
    setPlayer2Code(codeTemplates.phase2[player2Language])
  }, [])

  // Timer countdown effect
  React.useEffect(() => {
    if (!timerActive || timeRemaining <= 0) return

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setTimerActive(false)
          setOutput('⏰ TIME UP! The challenge has ended. Click RESET to try again.')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timerActive, timeRemaining])

  // Check if both players completed (stop timer)
  React.useEffect(() => {
    if (slotAFilled && slotBFilled && timerActive) {
      setTimerActive(false)
      const timeTaken = 600 - timeRemaining
      const minutes = Math.floor(timeTaken / 60)
      const seconds = timeTaken % 60
      setOutput(
        `🎉 VICTORY! Both players completed the challenge!

⏱️ Time taken: ${minutes}m ${seconds}s
🏆 Excellent teamwork!

🌳 The Bio-Digital Tree has been fully restored!`
      )
    }
  }, [slotAFilled, slotBFilled, timerActive, timeRemaining])

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div
      className="min-h-screen bg-black p-8"
      style={{ fontFamily: "'Space Mono', monospace" }}
    >
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-black rounded-lg shadow-2xl p-6 mb-6 border-4 border-red-600 shadow-red-900/50">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-5xl font-bold text-red-600 flex items-center gap-3 drop-shadow-[0_0_12px_rgba(220,38,38,1)] tracking-wider font-mono">
              <Users className="w-12 h-12 text-red-600 drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
              THE BIO-DIGITAL TREE
            </h1>
            {/* Timer Display */}
            {(() => {
              const timerBorderClass = timeRemaining <= 60
                ? 'border-red-600 bg-red-950/50 shadow-red-900/70 animate-pulse'
                : timeRemaining <= 180
                ? 'border-yellow-600 bg-yellow-950/30 shadow-yellow-900/50'
                : 'border-green-600 bg-green-950/30 shadow-green-900/50';

              const timerTextClass = timeRemaining <= 60
                ? 'text-red-400 drop-shadow-[0_0_12px_rgba(220,38,38,0.8)]'
                : timeRemaining <= 180
                ? 'text-yellow-400 drop-shadow-[0_0_12px_rgba(234,179,8,0.8)]'
                : 'text-green-400 drop-shadow-[0_0_12px_rgba(34,197,94,0.8)]';

              return (
                <div className={`flex flex-col items-center px-6 py-3 rounded-lg border-4 ${timerBorderClass}`}>
                  <div className="text-xs font-mono text-gray-400 mb-1">TIME REMAINING</div>
                  <div className={`text-4xl font-bold font-mono tracking-wider ${timerTextClass}`}>
                    {formatTime(timeRemaining)}
                  </div>
                  {timeRemaining <= 60 && (
                    <div className="text-xs font-mono text-red-400 mt-1 font-bold animate-pulse">⚠️ HURRY UP!</div>
                  )}
                </div>
              );
            })()}
          </div>
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
                  <div className="text-[10px] font-bold text-green-400 mb-1 font-mono drop-shadow-[0_0_4px_rgba(34,197,94,0.6)]">GEN 3</div>
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
                  <div className="text-[10px] text-green-500 mt-1 font-medium font-mono">Rajesh's child (Player 1)</div>
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
              <h3 className="font-bold text-green-400 mb-3 font-mono text-lg drop-shadow-[0_0_6px_rgba(34,197,94,0.6)] tracking-wider">BST INSERTION RULES:</h3>
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
                    <strong className="text-green-400">AGE COMPARISON:</strong> Compare child's age with existing nodes
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold drop-shadow-[0_0_4px_rgba(220,38,38,0.6)]">3.</span>
                  <span>
                    <strong className="text-green-400">BST NAVIGATION:</strong> If age &lt; node.age, go LEFT; if age &gt; node.age, go RIGHT
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold drop-shadow-[0_0_4px_rgba(220,38,38,0.6)]">4.</span>
                  <span>
                    <strong className="text-green-400">INSERTION:</strong> Place node when you reach an empty position (null)
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
                  value={currentPhase === 1 ? player1Language : player2Language}
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
              <p className="text-sm text-green-300 font-mono mb-3">
                {currentPhase === 1
                  ? 'Write code logic to insert Sam (24) into the correct position in the tree.'
                  : 'Write code logic to insert Vikram (26) into the correct position in the tree.'}
              </p>
              <div className="bg-red-950/30 border-2 border-yellow-500 rounded p-3 mt-2">
                <h4 className="text-yellow-400 font-bold text-xs mb-2 font-mono">⚠️ IMPORTANT - What We're Looking For:</h4>
                <ul className="text-yellow-300 text-xs space-y-1 font-mono">
                  <li>✓ Mention the child's name and age (Sam/24 or Vikram/26)</li>
                  <li>✓ Mention the parent node (Rajesh or Seema)</li>
                  <li>✓ Show age comparison using &gt; operator</li>
                  <li>✓ Show left/right navigation logic</li>
                  <li className="text-red-400 font-bold mt-2">⚠️ Pseudocode is fine! Full implementation NOT required.</li>
                </ul>
              </div>
            </div>

            {/* Code Editor */}
            <div className="relative">
              <textarea
                value={currentPhase === 1 ? player1Code : player2Code}
                onChange={(e) => {
                  if (currentPhase === 1) {
                    setPlayer1Code(e.target.value)
                  } else {
                    setPlayer2Code(e.target.value)
                  }
                }}
                className="w-full h-64 p-4 pl-12 font-mono text-sm border-4 border-green-600 rounded-lg focus:outline-none focus:ring-4 focus:ring-green-500 bg-black text-green-400 shadow-green-900/30 overflow-y-auto resize-none"
                placeholder={`Write your ${currentPhase === 1 ? player1Language : player2Language} code here...`}
                spellCheck="false"
                id="code-textarea"
                onScroll={(e) => {
                  const lineNumbers = document.getElementById('line-numbers');
                  if (lineNumbers) {
                    lineNumbers.scrollTop = e.target.scrollTop;
                  }
                }}
              />
              {/* Line numbers */}
              <div 
                id="line-numbers"
                className="absolute left-0 top-0 p-4 pointer-events-none h-64 overflow-hidden border-4 border-transparent rounded-lg"
              >
                <div className="font-mono text-sm text-green-600/50 select-none">
                  {(currentPhase === 1 ? player1Code : player2Code).split('\n').map((_, i) => (
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
                  <p className="text-green-300 mb-2">Write a BST insertion algorithm to place Sam (24) under Rajesh.</p>
                  <ul className="text-green-300 text-xs space-y-1 ml-4">
                    <li>• Find parent node: Rajesh (age 58)</li>
                    <li>• Compare Sam's age (24) with siblings</li>
                    <li>• Navigate left/right based on age</li>
                    <li>• Insert Sam in correct BST position</li>
                  </ul>
            </div>
      <div className="bg-black border-2 border-green-600 p-4 rounded shadow-green-900/30">
                  <h4 className="font-bold text-green-400 mb-2 text-lg tracking-wider drop-shadow-[0_0_6px_rgba(34,197,94,0.6)]">PLAYER 2 (SLOT B - SEEMA ➜ VIKRAM)</h4>
                  <p className="text-green-300 mb-2">Write a BST insertion algorithm to place Vikram (26) under Seema.</p>
                  <ul className="text-green-300 text-xs space-y-1 ml-4">
                    <li>• Find parent node: Seema (age 48)</li>
                    <li>• Compare Vikram's age (26) with siblings</li>
                    <li>• Navigate left/right based on age</li>
                    <li>• Insert Vikram in correct BST position</li>
                  </ul>
            </div>
          </div>
      </div>
      </div>
    </div>
  )
}

export default BioDigitalTree
