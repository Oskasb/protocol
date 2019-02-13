define([],
	function () {
		'use strict';


        function LineRenderer() {

            this._numRenderingLines = 0;
            this.MAX_NUM_LINES = 50000;

            this.geometry = new THREE.BufferGeometry();


            var positions = new Float32Array( this.MAX_NUM_LINES * 6 ); // 3 vertices per point
            this.geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );

            this.positions = this.geometry.attributes.position.array;


            var colors = new Float32Array( this.MAX_NUM_LINES * 6 ); // 3 vertices per point
            this.geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );


            this.positions = this.geometry.attributes.position.array;
            this.colors = this.geometry.attributes.color.array;

            this.geometry.setDrawRange( 0, 0);

            this.material = new THREE.LineBasicMaterial( {
                color: 0xffffff,
                blending:THREE.NoBlending,
                depthTest:false,
                depthWrite:true,
                vertexColors: THREE.VertexColors,
                side:THREE.DoubleSide
            } );

            this.line = new THREE.LineSegments( this.geometry,  this.material);
            this.line.frustumCulled = false;
            this.line.renderOrder = 1;
            ThreeAPI.addToScene( this.line );

        }

        
        var vecByIndex = function(vec, i) {
            if (i === 0) return vec.x;
            if (i === 1) return vec.y;
            if (i === 2) return vec.z;
        };

        LineRenderer.prototype._addLine = function (start, end, color) {
            
            //We can not continue if there is no more space in the buffers.
            if (this._numRenderingLines >= this.MAX_NUM_LINES) {
                console.warn('MAX_NUM_LINES has been exceeded in the LineRenderer.');
                return;
            }

            var vertexIndex = this._numRenderingLines * 6;

            for (var i = 0; i < 3; i++) {

                var firstVertexDataIndex = vertexIndex + i;
                var secondVertexDataIndex = vertexIndex + 3 + i;

                this.positions[firstVertexDataIndex] = vecByIndex(start, i);
                this.positions[secondVertexDataIndex] = vecByIndex(end, i);
                
                this.colors[firstVertexDataIndex] = vecByIndex(color, i);
                this.colors[secondVertexDataIndex] = vecByIndex(color, i);

            }
            
            this.geometry.attributes.position.needsUpdate = true;
            this.geometry.attributes.color.needsUpdate = true;
            this._numRenderingLines++;
            
            this.geometry.setDrawRange( 0, this._numRenderingLines * 2 );
            
        };

        LineRenderer.prototype._clear = function () {
            this._numRenderingLines = 0;
            this.geometry.setDrawRange( 0, 0);
        };

        LineRenderer.prototype._pause = function () {
            this._numRenderingLines = 0;
            this.geometry.setDrawRange( 0, this._numRenderingLines * 2 );
        };
        
        LineRenderer.prototype._remove = function () {
            console.log("Should remove linerenderer here")
        };

		return LineRenderer;
	});