#!/bin/bash

set -euxo pipefail

TARGET=$1

sed -i'' "/@beginExercise/,/@endExercise/d" $TARGET
