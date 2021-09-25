class Path {
  constructor(center) {
    this.points = []
    this.selectedPointIndex = undefined
    this.selectedSegmentIndex = undefined
    let scale = width / 3
    this.points.push(createVector(center.x - scale, center.y))
    this.points.push(createVector(center.x - scale / 2, center.y - scale / 2))
    this.points.push(createVector(center.x + scale / 2, center.y + scale / 2))
    this.points.push(createVector(center.x + scale, center.y))

    this.isClosed = false
    this.autoSet = true
  }


  addSegment(anchorPos) {
    if (!this.isClosed) {
      this.points.push(p5.Vector.sub(p5.Vector.mult(this.points[this.points.length - 1], 2), this.points[this.points.length - 2]))

      this.points.push(p5.Vector.mult(p5.Vector.add(this.points[this.points.length - 1], anchorPos), 0.5))

      this.points.push(anchorPos)

      if (this.autoSet) {
        this.autoSetAllAffected(this.points.length - 1)
      }
    }
  }

  splitSegment(anchorPos, segmentIndex) {
    this.points.splice(segmentIndex * 3 + 2, 0, createVector(0, 0))
    this.points.splice(segmentIndex * 3 + 3, 0, anchorPos)
    this.points.splice(segmentIndex * 3 + 4, 0, createVector(0, 0))

    if (this.autoSet) {
      this.autoSetAllAffected(segmentIndex * 3 + 3)
    } else {
      this.autoSetPoints(segmentIndex * 3 + 3)
    }
  }

  deleteSegment(anchorIndex) {
    if (this.numSegments() > 2 || this.IsClosed && this.numSegments() > 1) {
      if (anchorIndex == 0) {
        if (this.isClosed) {
          let temp = this.points[2]
          this.points[this.points.length - 1] = temp
        }
        this.points.splice(0, 3)
      } else if (anchorIndex == this.points.length - 1 && !this.isClosed) {
        this.points.splice(anchorIndex - 2, 3)
      } else {
        this.points.splice(anchorIndex - 1, 3)
      }

    }
  }

  getPointsInSegment(index) {
    let points = []
    points.push(this.points[this.loopIndex(index * 3 + 0)])
    points.push(this.points[this.loopIndex(index * 3 + 1)])
    points.push(this.points[this.loopIndex(index * 3 + 2)])
    points.push(this.points[this.loopIndex(index * 3 + 3)])

    return points
  }

  numSegments() {
    return floor(this.points.length / 3)
  }

  movePoint(index, pos) {
    let deltaMove = p5.Vector.sub(pos, this.points[index])
    if (index % 3 == 0 || !this.autoSet) {
      this.points[index] = pos

      if (this.autoSet) {
        this.autoSetAllAffected(index)
      } else {

        if (index % 3 == 0) {
          if (index + 1 < this.points.length || this.isClosed) {
            this.points[this.loopIndex(index + 1)].add(deltaMove)
          }
          if (index - 1 >= 0 || this.isClosed) {
            this.points[this.loopIndex(index - 1)].add(deltaMove)
          }
        } else {
          let nextPointIsAnchor = (index + 1) % 3 == 0
          let otherControl = (nextPointIsAnchor) ? index + 2 : index - 2
          let anchor = (nextPointIsAnchor) ? index + 1 : index - 1

          if (otherControl >= 0 && otherControl < this.points.length || this.isClosed) {
            let dst = this.points[this.loopIndex(anchor)].dist(this.points[this.loopIndex(otherControl)])
            let dir = p5.Vector.sub(this.points[this.loopIndex(anchor)], pos).normalize()

            this.points[this.loopIndex(otherControl)] = p5.Vector.add(this.points[this.loopIndex(anchor)], dir.mult(dst))
          }
        }
      }
    }
  }

  autoSetAllAffected(updatedAnchorIndex) {
    for (let i = updatedAnchorIndex - 3; i <= updatedAnchorIndex + 3; i += 3) {
      if (i >= 0 && i < this.points.length || this.isClosed) {
        this.autoSetPoints(this.loopIndex(i))
      }
    }
    this.autoSetStartEnd()
  }

  autoSetAll() {
    for (let i = 0; i < this.points.length; i += 3) {
      this.autoSetPoints(i)
    }
    this.autoSetStartEnd()

  }

  autoSetPoints(anchorIndex) {
    let anchorPos = this.points[anchorIndex]
    let dir = createVector()
    let neighboursDistances = []
    let offset
    if (anchorIndex - 3 >= 0 || this.isClosed) {
      offset = p5.Vector.sub(this.points[this.loopIndex(anchorIndex - 3)], anchorPos)
      dir.add(offset.copy().normalize())
      neighboursDistances[0] = offset.mag()
    }
    if (anchorIndex + 3 >= 0 || this.isClosed) {
      offset = p5.Vector.sub(this.points[this.loopIndex(anchorIndex + 3)], anchorPos)
      dir.sub(offset.copy().normalize())
      neighboursDistances[1] = -offset.mag()
    }
    dir.normalize()

    for (let i = 0; i < 2; i++) {
      let controlIndex = anchorIndex + i * 2 - 1
      if (controlIndex >= 0 && controlIndex < this.points.length || this.isClosed) {
        this.points[this.loopIndex(controlIndex)] = p5.Vector.add(anchorPos, p5.Vector.mult(dir, neighboursDistances[i]).mult(0.5))
      }

    }
  }

  autoSetStartEnd() {
    if (!this.isClosed) {
      this.points[1] = p5.Vector.add(this.points[0], this.points[2]).mult(0.5)
      this.points[this.points.length - 2] = p5.Vector.add(this.points[this.points.length - 1], this.points[this.points.length - 3]).mult(0.5)
    }
  }

  toggleClosed() {
    this.isClosed = !this.isClosed

    if (this.isClosed) {
      this.points.push(p5.Vector.sub(p5.Vector.mult(this.points[this.points.length - 1], 2), this.points[this.points.length - 2]))
      this.points.push(p5.Vector.sub(p5.Vector.mult(this.points[0], 2), this.points[1]))

      if (this.autoSet) {
        this.autoSetPoints(0)
        this.autoSetPoints(this.points.length - 3)
      }
    } else {
      this.points.splice(this.points.length - 2, 2)
      if (this.autoSet) {
        this.autoSetStartEnd()
      }
    }
  }

  evenlySpacedPoints(spacing, resolution = 1) {
    let evenlySpacedPoints = []
    evenlySpacedPoints.push(this.points[0])
    let previousPoint = this.points[0]
    let dstSinceLast = 0
    for (let segmentIndex = 0; segmentIndex < this.numSegments(); segmentIndex++) {
      let p = this.getPointsInSegment(segmentIndex)
      let controlNetLength = p[0].dist(p[1]) + p[1].dist(p[2]) + p[2].dist(p[3])
      let estimatedCurveLength = p[0].dist(p[3]) + controlNetLength / 2
      let divisions = ceil(estimatedCurveLength * resolution * 10)
      let t = 0
      while (t <= 1) {
        t += 1 / divisions
        let pointOnCurve = evaluateCubic(p[0], p[1], p[2], p[3], t)
        dstSinceLast += previousPoint.dist(pointOnCurve)
        while (dstSinceLast >= spacing) {
          let overShoot = dstSinceLast - spacing
          let newEvenlySpacedPoint = p5.Vector.add(pointOnCurve, p5.Vector.sub(previousPoint, pointOnCurve).normalize().mult(overShoot))
          evenlySpacedPoints.push(newEvenlySpacedPoint)
          dstSinceLast = overShoot
          previousPoint = newEvenlySpacedPoint
        }

        previousPoint = pointOnCurve
      }
    }
    return evenlySpacedPoints
  }

  loopIndex(index) {
    return (index + this.points.length) % this.points.length
  }
  renderRoadMesh(roadWidth, roadDetail, tiling) {
    let points = this.evenlySpacedPoints(roadDetail, 1)
    texture(roadTexture)
    textureMode(NORMAL)
    textureWrap(REPEAT)

    beginShape(TRIANGLE_STRIP)


    for (let i = 0; i < points.length + this.isClosed; i++) {
      let forward = createVector(0, 0)
      if (i < points.length - 1 || this.isClosed) {
        forward.add(p5.Vector.sub(points[(i + 1) % points.length], points[i % points.length]))
      }
      if (i > 0 || this.isClosed) {
        forward.add(p5.Vector.sub(points[i % points.length], points[(i - 1 + points.length) % points.length]))
      }
      forward.normalize()

      let left = createVector(-forward.y, forward.x)

      let p1 = p5.Vector.add(points[i % points.length], left.copy().mult(roadWidth * 0.5))
      vertex(p1.x, p1.y, 0, i * tiling)
      let p2 = p5.Vector.sub(points[i % points.length], left.mult(roadWidth * 0.5))
      vertex(p2.x, p2.y, 1, i * tiling)



    }
    endShape()
  }

  render() {
    if (this.isClosed != params.closePath) {
      this.toggleClosed()
    }

    if (this.autoSet != params.autoSetControlPoints) {
      this.autoSet = !path.autoSet
      if (this.autoSet) {
        this.autoSetAll()
      }
    }

    if (params.drawMesh) {
      this.renderRoadMesh(params.roadWidth, params.roadDetail, params.roadTiling)
    }

    let renderControlPoints = params.showControlPoints

    noFill()

    for (let i = 0; i < this.numSegments(); i++) {
      let points = this.getPointsInSegment(i)

      if (renderControlPoints) {
        stroke(0)
        strokeWeight(1)
        line(points[0].x, points[0].y, points[1].x, points[1].y)
        line(points[2].x, points[2].y, points[3].x, points[3].y)
      }

      strokeWeight(2)
      if (i == this.selectedSegmentIndex) {
        stroke(255, 255, 0)
      } else {
        stroke(0, 255, 0)
      }
      bezier(points[0].x, points[0].y, points[1].x, points[1].y, points[2].x, points[2].y, points[3].x, points[3].y)
    }

    for (let p = 0; p < this.points.length; p++) {
      if (p % 3 == 0) {
        stroke(255, 0, 0)
        strokeWeight(15)
      } else {
        stroke(255)
        strokeWeight(10)
      }
      if (this.selectedPointIndex == p) {
        stroke(255, 255, 0)
      }

      if (renderControlPoints && p % 3 != 0 || p % 3 == 0)
        point(this.points[p].x, this.points[p].y)
    }
    this.edit()
  }
  edit() {
    if (mouseIsPressed && this.selectedPointIndex != undefined) {
      this.movePoint(this.selectedPointIndex, createVector(mouseX, mouseY))
    }

    this.selectedSegmentIndex = undefined
    for (let i = 0; i < this.numSegments(); i++) {
      let approximationPoints = []
      let points = this.getPointsInSegment(i)
      for (let t = 0; t < 1; t += 0.005) {
        let p = evaluateCubic(points[0], points[1], points[2], points[3], t)
        if (dist(p.x, p.y, mouseX, mouseY) < 10) {
          this.selectedSegmentIndex = i
          break
        }
      }
    }
  }
  mousePressed() {
    this.selectedPointIndex = undefined
    for (let p = 0; p < this.points.length; p++) {
      if (dist(mouseX, mouseY, this.points[p].x, this.points[p].y) < 10) {
        if (mouseButton == LEFT) {
          this.selectedPointIndex = p
          return
        } else if (mouseButton == RIGHT && p % 3 == 0) {
          this.deleteSegment(p)
        }
      }
    }
    if (this.selectedSegmentIndex != undefined && mouseButton == LEFT) {
      this.splitSegment(createVector(mouseX, mouseY), this.selectedSegmentIndex)
    }
  }
}