import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';

const RoadNotTaken = () => {
  const [probability, setProbability] = useState(0.5);
  const [totalBalls, setTotalBalls] = useState(100);
  const [distribution, setDistribution] = useState([]);
  const [manualMode, setManualMode] = useState(false);
  const [position, setPosition] = useState({ x: 5, y: 0 });
  const [choices, setChoices] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [pathHistory, setPathHistory] = useState([{ x: 5, y: 0 }]);
  const [completedPaths, setCompletedPaths] = useState([]);

  const TOTAL_CHOICES = 10;
  const GRID_WIDTH = 11;
  const GRID_HEIGHT = 10;
  const BALL_RADIUS = 6;
  const BALL_SPACING = 14;

  // Calculate binomial coefficient
  const binomialCoeff = (n, k) => {
    if (k === 0 || k === n) return 1;
    if (k > n) return 0;
    let res = 1;
    for (let i = 0; i < k; i++) {
      res *= (n - i);
      res /= (i + 1);
    }
    return res;
  };

  // Calculate theoretical distribution
  const calculateDistribution = () => {
    const dist = [];
    for (let k = 0; k <= TOTAL_CHOICES; k++) {
      const coeff = binomialCoeff(TOTAL_CHOICES, k);
      const prob = coeff * Math.pow(probability, k) * Math.pow(1 - probability, TOTAL_CHOICES - k);
      const balls = Math.round(prob * totalBalls);
      dist.push(balls);
    }
    setDistribution(dist);
  };

  useEffect(() => {
    if (!manualMode) {
      calculateDistribution();
    }
  }, [probability, totalBalls, manualMode]);

  // Manual game controls
  const makeChoice = (direction) => {
    if (choices.length >= TOTAL_CHOICES) return;

    const newChoices = [...choices, direction];
    setChoices(newChoices);

    const newX = position.x + (direction === 'left' ? -1 : 1);
    const newY = position.y + 1;
    setPosition({ x: newX, y: newY });
    
    const newPath = [...pathHistory, { x: newX, y: newY }];
    setPathHistory(newPath);

    if (newChoices.length === TOTAL_CHOICES) {
      setGameOver(true);
      setCompletedPaths([...completedPaths, newPath]);
    }
  };

  const resetGame = () => {
    setPosition({ x: 5, y: 0 });
    setChoices([]);
    setGameOver(false);
    setPathHistory([{ x: 5, y: 0 }]);
  };

  // Convert distribution index to x-coordinate
  const indexToX = (index) => {
    return 5 + (index - TOTAL_CHOICES/2);
  };

  // Get stacked endpoints for manual mode
  const getEndpointStacks = () => {
    const stacks = {};
    completedPaths.forEach((path) => {
      const endpoint = path[path.length - 1];
      const key = `${endpoint.x},${endpoint.y}`;
      if (!stacks[key]) {
        stacks[key] = [];
      }
      stacks[key].push(endpoint);
    });
    return stacks;
  };

  const switchMode = () => {
    setManualMode(!manualMode);
    if (manualMode) {
      // Switching to automatic
      calculateDistribution();
    } else {
      // Switching to manual
      setCompletedPaths([]);
      resetGame();
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-center">The Road Not Taken</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          {/* Controls */}
          <div className="w-full space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Probability of going right: {probability.toFixed(2)}
              </label>
              <Slider
                value={[probability * 100]}
                onValueChange={(value) => setProbability(value[0] / 100)}
                min={0}
                max={100}
                step={1}
                disabled={manualMode}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Total number of balls
              </label>
              <Input
                type="number"
                value={totalBalls}
                onChange={(e) => setTotalBalls(Number(e.target.value))}
                min={1}
                max={1000}
                disabled={manualMode}
                className="w-full"
              />
            </div>
            <Button 
              onClick={switchMode}
              className="w-full"
            >
              {manualMode ? "Switch to Automatic" : "Switch to Manual"}
            </Button>
          </div>

          {/* Grid visualization */}
          <div className="relative bg-gray-100 p-4 rounded-lg">
            <svg width="440" height="600" viewBox="0 0 440 600">
              {/* Grid points */}
              {Array.from({ length: GRID_HEIGHT + 1 }, (_, y) =>
                Array.from({ length: GRID_WIDTH }, (_, x) => (
                  <circle
                    key={`${x}-${y}`}
                    cx={40 * x + 20}
                    cy={40 * y}
                    r="3"
                    fill="gray"
                  />
                ))
              )}

              {/* Theoretical distribution */}
              {!manualMode && distribution.map((count, index) => {
                const x = indexToX(index);
                return Array.from({ length: count }).map((_, stackIndex) => (
                  <circle
                    key={`theory-${index}-${stackIndex}`}
                    cx={40 * x + 20}
                    cy={40 * GRID_HEIGHT - (stackIndex * BALL_SPACING)}
                    r={BALL_RADIUS}
                    fill="red"
                    opacity="0.8"
                  />
                ));
              })}

              {/* Manual mode visualization */}
              {manualMode && (
                <>
                  {/* Paths */}
                  {completedPaths.map((path, pathIndex) => (
                    <g key={`path-${pathIndex}`} opacity="0.3">
                      {path.slice(1).map((pos, i) => (
                        <line
                          key={`path-${pathIndex}-line-${i}`}
                          x1={40 * path[i].x + 20}
                          y1={40 * path[i].y}
                          x2={40 * pos.x + 20}
                          y2={40 * pos.y}
                          stroke="blue"
                          strokeWidth="2"
                        />
                      ))}
                    </g>
                  ))}

                  {/* Current path */}
                  {pathHistory.slice(1).map((pos, i) => (
                    <line
                      key={`current-${i}`}
                      x1={40 * pathHistory[i].x + 20}
                      y1={40 * pathHistory[i].y}
                      x2={40 * pos.x + 20}
                      y2={40 * pos.y}
                      stroke="blue"
                      strokeWidth="2"
                    />
                  ))}

                  {/* Stacked endpoint balls */}
                  {Object.entries(getEndpointStacks()).map(([key, endpoints], stackIndex) => {
                    const [x, y] = key.split(',').map(Number);
                    return endpoints.map((_, ballIndex) => (
                      <circle
                        key={`manual-stack-${stackIndex}-${ballIndex}`}
                        cx={40 * x + 20}
                        cy={40 * y - (ballIndex * BALL_SPACING)}
                        r={BALL_RADIUS}
                        fill="red"
                        opacity="0.8"
                      />
                    ));
                  })}

                  {/* Current position */}
                  {!gameOver && (
                    <circle
                      cx={40 * position.x + 20}
                      cy={40 * position.y}
                      r={BALL_RADIUS}
                      fill="red"
                    />
                  )}

                  {/* Manual mode counts */}
                  {Object.entries(getEndpointStacks()).map(([key, endpoints]) => {
                    const [x, y] = key.split(',').map(Number);
                    return (
                      <text
                        key={`manual-count-${key}`}
                        x={40 * x + 20}
                        y={40 * y + 20}
                        textAnchor="middle"
                        fill="black"
                        fontSize="12"
                      >
                        {endpoints.length}
                      </text>
                    );
                  })}
                </>
              )}

              {/* Theoretical distribution labels */}
              {!manualMode && distribution.map((count, index) => {
                const x = indexToX(index);
                return (
                  <text
                    key={`label-${index}`}
                    x={40 * x + 20}
                    y={40 * GRID_HEIGHT + 20}
                    textAnchor="middle"
                    fill="black"
                    fontSize="12"
                  >
                    {count}
                  </text>
                );
              })}
            </svg>
          </div>

          {/* Manual game controls */}
          {manualMode && (
            <div className="flex gap-4">
              <Button
                onClick={() => makeChoice('left')}
                disabled={gameOver}
                className="w-24"
              >
                Left
              </Button>
              <Button
                onClick={() => makeChoice('right')}
                disabled={gameOver}
                className="w-24"
              >
                Right
              </Button>
              {gameOver && (
                <Button onClick={resetGame} className="w-24">
                  Reset
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RoadNotTaken;
